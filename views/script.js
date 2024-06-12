document.querySelectorAll('.inventory-form').forEach(form => {
    form.addEventListener('click', function(event) {
        event.stopPropagation(); // 親のクリックイベントを停止
    });
});
