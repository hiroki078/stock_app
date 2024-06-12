const express = require('express');
const app = express();
const mysql = require('mysql');
const session = require('express-session');
const bcrypt = require('bcryptjs');
const bodyParser = require('body-parser');
const multer = require('multer');
const path = require('path')
const fs = require('fs');
const crypto = require('crypto');
const nodemailer = require('nodemailer');
const axios = require('axios');
require('dotenv').config();
const cloudinary = require('cloudinary').v2;
const { CloudinaryStorage } = require('multer-storage-cloudinary');


cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
});

const storage = new CloudinaryStorage({
    cloudinary: cloudinary,
    params: {
        folder: 'items',
        format: async (req, file) => 'png', // 画像形式を指定
        public_id: (req, file) => file.originalname.split('.')[0], // ファイル名を指定
    },
});

const upload = multer({ storage: storage });


app.use(express.static('public'))
app.use(express.urlencoded({extended: false}));
app.use(bodyParser.urlencoded({ extended: true }));

const connection = mysql.createConnection({
    host: "us-cluster-east-01.k8s.cleardb.net",
    user: "bf28eb10acbfb6",
    password: "bc6107dd",
    database: "heroku_41c6756fb51ba7c"
  });

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});

app.use(session({
    secret: 'your-secret-key',
    resave: false,
    saveUninitialized: true,
    
    })
)


  connection.connect((err) => {
    if (err) {
        console.error('error connecting: ' + err.stack);
        return;
    }
    console.log('connected as id ' + connection.threadId);
});



const uploadsDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadsDir)) {
    fs.mkdirSync(uploadsDir);
}
app.use('/uploads', express.static('uploads')); 
app.set('view engine', 'ejs');



//ログイン判定表示
app.use((req, res, next) => {
    if (req.session.userId === undefined) {
        res.locals.userName = 'ゲスト'
        res.locals.isLoggedIn = false;
    } else {
        res.locals.userName = req.session.userName;
        res.locals.email = req.session.email;
        res.locals.isLoggedIn = true;
    }
    next();
});

//トップ画面表示
app.get('/', (req, res) => {
    res.render('top.ejs');
});

//リスト画面表示
app.get('/index', (req, res) => {
    connection.query(
        'SELECT * FROM items',
        (error, results) => {
        res.render('index.ejs', {items: results})
        }
    )
});

//商品新規登録画面表示
app.get('/new', (req, res) => {
    res.render('new.ejs')
});

app.use('/uploads', express.static('uploads'));

//商品新規追加機能
app.post('/create', upload.single('itemPicture'), (req, res) => {
    const allergensArray = req.body.allergen ? (Array.isArray(req.body.allergen) ? req.body.allergen : [req.body.allergen]) : [];
    const allergensJson = JSON.stringify(allergensArray);

    const itemPicturePath = req.file ? req.file.path : null; // ファイルパスの取得

    connection.query(
        'insert into items (name, quantity, allergen, genre, picture) values (?, ?, ?, ?, ?)',
        [req.body.itemName, req.body.itemQuantity, allergensJson, req.body.selectedValue, itemPicturePath],
        (error, results) => {
            console.log('Uploaded file:', req.file);
            console.log(req.body.allergen); // デバッグ用
            console.log(allergensArray); // デバッグ用
            console.log(allergensJson); // デバッグ用
            console.log(itemPicturePath); // デバッグ用
            res.redirect('/index');
        })
    }
);


//商品編集画面表示
app.get('/edit/:id', (req, res) => {
    connection.query(
        'select * from items where id =?',
        [req.params.id],
        (error, results) => {
            res.render('edit.ejs', {item: results[0]})
        }
    )
});

//商品編集機能
app.post('/update/:id', upload.single('itemPicture'), (req, res) => {
    const allergensArray = req.body.allergen ? (Array.isArray(req.body.allergen) ? req.body.allergen : [req.body.allergen]) : [];
    const allergensJson = JSON.stringify(allergensArray);

    const itemPicturePath = req.file ? req.file.path : null; // ファイルパスの取得

    const updateQuery = itemPicturePath ?
        'UPDATE items SET name=?, allergen=?, genre=?, picture=?, energy=?, protein=?, lipids=?, carbohydrate=?, salt=? WHERE id=?' :
        'UPDATE items SET name=?, allergen=?, genre=?, energy=?, protein=?, lipids=?, carbohydrate=?, salt=? WHERE id=?';

    const queryParams = itemPicturePath ?
        [req.body.itemName, allergensJson, req.body.selectedValue, itemPicturePath, req.body.itemEnergy, req.body.itemProtein, req.body.itemLipids, req.body.itemCarbohydrate, req.body.itemSalt, req.params.id] :
        [req.body.itemName, allergensJson, req.body.selectedValue, req.body.itemEnergy, req.body.itemProtein, req.body.itemLipids, req.body.itemCarbohydrate, req.body.itemSalt, req.params.id];

    connection.query(updateQuery, queryParams,
        (error, results) => {
            res.redirect('/index')
        }
    )
});

//商品検索機能
app.post('/search', (req, res) => {
    const searchItemName = req.body.searchItemName;
    connection.query(
        'select * from items where name like ?',
        [searchItemName],
        (error, results) => {
            res.render('item_narrow.ejs', {items: results})
        }
    )
});

//商品のジャンル絞り機能
app.get('/genre', (req, res) => {
    connection.query(
        'select * from items where genre =?',
        [req.query.selectedValue],
        (error, results) => {
            console.log(req.query.selectedValue)
            res.render('item_narrow.ejs', {items: results});
        }
    )
});

//店舗の絞り込み機能
app.get('/store/narrow', (req, res) => {
    connection.query(
        'select * from stores where prefecture = ?',
        [req.query.selectedValue],
        (error, results) => {
            res.render('store_narrow.ejs', {stores: results})
        }
    )
})

//ログイン画面表示
app.get('/login', (req, res) => {
    res.render('login.ejs', {errors:[]})
});

//ログイン機能
app.post('/login', (req, res) => {
    const { email, password } = req.body;

    connection.query(
        'SELECT * FROM users WHERE email = ?',
        [email],
        (error, results) => {
            if (error || results.length === 0) {
                return res.render('login.ejs', { errors: ['メールアドレスまたはパスワードが間違っています'] });
            }

            const user = results[0];

            if (!user.isVerified) {
                return res.render('login.ejs', { errors: ['メールアドレスが認証されていません'] });
            }

            bcrypt.compare(password, user.password, (error, isMatch) => {
                if (error || !isMatch) {
                    return res.render('login.ejs', { errors: ['メールアドレスまたはパスワードが間違っています'] });
                }

                // ログイン成功処理
                req.session.userId = user.id;
                req.session.userName = user.userName;
                res.redirect('/');
            });
        }
    );
});



//ログアウト機能
app.get('/logout', (req, res) => {
    req.session.destroy((error) => {
        console.log('ログアウト')
        res.redirect('/index');
    })
});

//ユーザー登録画面表示
app.get('/signup', (req, res) => {
    res.render('signup.ejs', {errors:[]});
});

//ユーザー登録機能
// メール送信設定
const transporter = nodemailer.createTransport({
    service: 'Gmail',
    auth: {
        user: "hiroki708708@gmail.com", //送信用メールアドレス
        pass: "cxpg xtkt iapx vomm" //gooleアプリパスワード生成したもの
    }
});

app.post('/signup', 
(req, res, next) => {
    const errors = [];
    
    if (req.body.userName === '') errors.push('ユーザー名が空です');
    if (req.body.email === '') errors.push('メールアドレスが空です');
    if (req.body.password === '') errors.push('パスワードが空です');
    if (req.body.password !== req.body.confirmPassword) errors.push('パスワードが一致しません');
    
    if (errors.length > 0) {
        return res.render('signup.ejs', { errors: errors });
    }
    next();
},
(req, res, next) => {
    connection.query(
        'SELECT * FROM users WHERE email = ?',
        [req.body.email],
        (error, results) => {
            if (results.length > 0) {
                return res.render('signup.ejs', { errors: ['入力されたメールアドレスはすでに登録されています。'] });
            }
            next();
        }
    );
},
(req, res) => {
    const token = crypto.randomBytes(32).toString('hex');
    const userId = crypto.randomUUID();
    const { email, userName, password } = req.body;

    bcrypt.hash(password, 10, (error, hash) => {
        if (error) {
            console.error('Error hashing password:', error);
            return res.status(500).send('Internal Server Error');
        }

        connection.query(
            'INSERT INTO users(id, userName, email, password, isVerified) VALUES(?, ?, ?, ?, ?)',
            [userId, userName, email, hash, 0],
            (error, results) => {
                if (error) {
                    console.error('Error inserting user:', error);
                    return res.status(500).send('Internal Server Error');
                }

                connection.query(
                    'INSERT INTO verification_tokens(token, user_id) VALUES(?, ?)',
                    [token, userId],
                    (error, results) => {
                        if (error) {
                            console.error('Error inserting token:', error);
                            return res.status(500).send('Internal Server Error');
                        }

                        const verificationLink = `https://sheltered-springs-28559-5fd55330303b.herokuapp.com/verify-email?token=${token}`;
                        const mailOptions = {
                            from: "hiroki708708@gmail.com", //送信用メールアドレス
                            to: email, //送信先メールアドレス
                            subject: 'メールアドレス確認',
                            text: ` 
                            ${userName} さん、こんにちは！
                            在庫確認リストアプリの登録ありがとうございます！
                            以下のリンクをクリックしてメールアドレスを確認してください: 
                            ${verificationLink}`
                        };

                        transporter.sendMail(mailOptions, (error, info) => {
                            if (error) {
                                console.error('Error sending email:', error);
                                return res.status(500).send('Internal Server Error');
                            }
                            console.log('Email sent: ', info.response);
                            res.render('signup-success.ejs');
                        });
                    }
                );
            }
        );
    });
});

//メール認証
app.get('/verify-email', (req, res) => {
    const { token } = req.query;

    connection.query(
        'SELECT * FROM verification_tokens WHERE token = ?',
        [token],
        (error, results) => {
            if (error || results.length === 0) {
                console.error('Invalid token:', error);
                return res.status(400).send('Invalid token');
            }

            const userId = results[0].user_id;

            connection.query(
                'UPDATE users SET isVerified = 1 WHERE id = ?',
                [userId],
                (error, results) => {
                    if (error) {
                        console.error('Error verifying user:', error);
                        return res.status(500).send('Internal Server Error');
                    }

                    connection.query(
                        'DELETE FROM verification_tokens WHERE token = ?',
                        [token],
                        (error, results) => {
                            if (error) {
                                console.error('Error deleting token:', error);
                                return res.status(500).send('Internal Server Error');
                            }

                            res.send('メールアドレスの認証に成功しました!');
                        }
                    );
                }
            );
        }
    );
});


//ユーザー情報画面表示
app.get('/user', (req, res) => {
    res.render('user.ejs');
});

//商品情報画面表示
app.get('/itemInfo/:id', (req, res) => {
    connection.query(
        'select * from items where id = ?',
        [req.params.id],
        (error, results) => {
            res.render('itemInfo.ejs', {item: results[0]})
        }
    )
});

//商品から在庫保有店舗を探す
app.get('/item/:id/stockSearch', (req, res) => {
    connection.query(
        'SELECT stores.*, store_items.item_id, store_items.quantity, store_items.last_updated, store_items.price FROM stores JOIN store_items ON stores.id = store_items.store_id WHERE store_items.item_id = ?',
        [req.params.id],
        (error, results) => {
            console.log(req.params.id)
            console.log(results)
            res.render('store_stockSearch.ejs', {stores: results})
        }
    )
})

//クーポン画面表示
app.get('/coupon', (req, res) => {
    res.render('coupon.ejs')
});

//店舗一覧画面表示
app.get('/stores', (req, res) => {
    connection.query(
        'SELECT * FROM stores',
        (error, results) => {
            if (error) throw error;
            console.log('Stores data from database:', results); // デバッグ用のログ
            res.render('stores.ejs', { stores: results });
        }
    );
});


async function getCoordinates(address) {
    const apiKey = 'api';
    const response = await axios.get(`https://maps.googleapis.com/maps/api/geocode/json`, {
        params: {
            address: address,
            key: apiKey
        }
    });
    const data = response.data;
    if (data.status === 'OK') {
        const location = data.results[0].geometry.location;
        return {
            lat: location.lat,
            lng: location.lng
        };
    } else {
        throw new Error('Geocoding failed');
    }
}

//店舗情報追加機能
app.post('/stores/create', async (req, res) => {
    const storeName = req.body.storeName;
    const storeLocation = req.body.storeLocation;
    const storePhone = req.body.storePhone;
    const prefecture = req.body.selectedValue;

    try {
        const coordinates = await getCoordinates(storeLocation);

        connection.query(
            'INSERT INTO stores (name, location, phone, prefecture, latitude, longitude) VALUES (?, ?, ?, ?, ?, ?)',
            [storeName, storeLocation, storePhone, prefecture, coordinates.lat, coordinates.lng],
            (error, results) => {
                if (error) throw error;
                res.redirect('/stores');
            }
        );
    } catch (error) {
        res.status(500).send('Geocoding failed');
    }
});


//店舗在庫一覧
app.get('/stores/:id/items', (req, res) => {
    const storeId = req.params.id; //store.idから受け渡されているid
    connection.query(
        'SELECT items.*, store_items.store_id, store_items.si_id, store_items.quantity, store_items.price, store_items.last_updated FROM items JOIN store_items ON items.id = store_items.item_id WHERE store_items.store_id = ?',
        [storeId],
        (error, results) => {
            console.log(results)
            if (error) throw error;
            res.render('store_items.ejs', { items: results, storeId: storeId});
        }
    );
});

//店舗在庫の商品ジャンル絞り込み
app.get('/stores/:id/items/genre', (req, res) => {
    const storeId = req.params.id
    connection.query(
        'SELECT items.*, store_items.store_id, store_items.si_id, store_items.quantity, store_items.price, store_items.last_updated FROM items JOIN store_items ON items.id = store_items.item_id WHERE store_items.store_id = ? AND items.genre = ?',
        [storeId, req.query.selectItemNarrow],
        (error, results) => {
            console.log(storeId)
            console.log(req.query.selectItemNarrow)
            res.render('store_itemNarrow.ejs', {items: results, storeId: storeId})
        }
    )
})

//店舗在庫追加画面の表示
app.get('/stores/:id/items/new', (req, res) => {
    const storeId = req.params.id;
    res.render('new_store_item.ejs', { storeId });
});

// 商品新規追加機能と店舗在庫テーブルへの商品追加機能の統合
app.post('/stores/:id/items/create', upload.single('itemPicture'), (req, res) => {
    const storeId = req.params.id;
    const itemName = req.body.itemName;
    const itemQuantity = req.body.itemQuantity;
    const itemPrice = req.body.itemPrice;
    const itemEnergy = req.body.itemEnergy;
    const itemProtein = req.body.itemProtein;
    const itemLipids = req.body.itemLipids;
    const itemCarbohydrate = req.body.itemCarbohydrate;
    const itemSalt = req.body.itemSalt;
    const allergensArray = req.body.allergen ? (Array.isArray(req.body.allergen) ? req.body.allergen : [req.body.allergen]) : [];
    const allergensJson = JSON.stringify(allergensArray);
    const itemPicturePath = req.file ? req.file.path : null;

    console.log('Store ID:', storeId); // デバッグ用
    // デバッグ用に各フィールドをログ出力
    console.log({
        itemName,
        itemQuantity,
        itemPrice,
        itemEnergy,
        itemProtein,
        itemLipids,
        itemCarbohydrate,
        itemSalt,
        allergensArray,
        allergensJson,
        itemPicturePath
    });

    // 商品が既に存在するか確認し、存在しない場合は新規作成する
    connection.query(
        'SELECT id FROM items WHERE name = ?',
        [itemName],
        (error, results) => {
            if (error) throw error;

            let itemId;
            if (results.length > 0) {
                itemId = results[0].id;
                addItemToStore(storeId, itemId, itemQuantity, itemPrice, res);
            } else {
                connection.query(
                    'INSERT INTO items (name, allergen, genre, picture, energy, protein, lipids, carbohydrate, salt) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)',
                    [itemName, allergensJson, req.body.selectedValue, itemPicturePath, itemEnergy, itemProtein, itemLipids, itemCarbohydrate, itemSalt],
                    (error, results) => {
                        if (error) throw error;
                        itemId = results.insertId;
                        addItemToStore(storeId, itemId, itemQuantity, itemPrice, res);
                    }
                );
            }
        }
    );
});

function addItemToStore(storeId, itemId, itemQuantity, itemPrice, res) {
    console.log('Add Item to Store:');
    console.log('storeId:', storeId);
    console.log('itemId:', itemId);
    console.log('itemQuantity:', itemQuantity);
    console.log('itemPrice:', itemPrice)

    const query = 'INSERT INTO store_items (store_id, item_id, quantity, price) VALUES (?, ?, ?, ?)';
    const values = [storeId, itemId, itemQuantity, itemPrice];

    connection.query(query, values, (error, results) => {
        if (error) {
            console.error('Error inserting into store_items:', error);
            throw error;
        }
        res.redirect(`/stores/${storeId}/items`);
    });
}


//商品情報確認画面表示　店舗在庫から
app.get('/stores/:id/items/itemInfo', (req, res) => {
    connection.query(
        'SELECT items.*, store_items.quantity FROM items JOIN store_items ON items.id = store_items.item_id WHERE items.id = ?',
        [req.params.id],
        (error, results) => {
            res.render('store_itemInfo.ejs', {item: results[0]})

        }
    )
})




//店舗情報追加画面
app.get('/stores/new', (req, res) => {
    res.render('new_store.ejs');
});



//店舗詳細情報確認画面
app.get('/stores/:id/storeInfo', (req, res) => {
    connection.query(
        'select * from stores where id = ?',
        [req.params.id],
        (error, results) =>{
            res.render('storeInfo.ejs', {store: results[0]})
        }
    )
})

//在庫数と販売価格の更新画面表示
app.get('/stores/:si_id/items/edit', (req, res) => {
    connection.query(
        'SELECT items.*, store_items.si_id, store_items.quantity, store_items.price FROM items JOIN store_items ON items.id = store_items.item_id WHERE store_items.si_id= ?',
        [req.params.si_id],
        (error, results) => {
            res.render('itemQuantity_update.ejs', {item: results[0]})
        }
    )
})


//在庫数と販売価格の更新実行
app.post('/stores/:si_id/items/edit', (req, res) => {
    connection.query(
        'update store_items set price=?, quantity=? where si_id=?',
        [req.body.itemPrice, req.body.itemQuantity, req.params.si_id],
        (error, results) => {
            res.redirect('/stores');
        }
    )
})

//店舗商品削除ボタン
app.post('/stores/:si_id/items/delete', (req, res) => {
    connection.query(
        'delete from store_items where si_id=?',
        [req.params.si_id],
        (error, results) => {
            console.log(req.params.si_id)
            console.log(results)
            res.redirect('/stores')
        }
    )
})


