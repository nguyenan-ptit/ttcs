(function () {

    function renderBarChart(targetId, rows, formatter) {
        const target = document.getElementById(targetId);
        if (!target) return;
        if (!rows.length) {
            target.innerHTML = '<div class="empty-state">Chưa có dữ liệu để hiển thị.</div>';
            return;
        }

        const maxValue = Math.max(...rows.map((row) => row.value), 1);
        target.innerHTML = rows.map((row) => {
            const width = Math.max(8, Math.round((row.value / maxValue) * 100));
            const valueText = formatter ? formatter(row.value, row) : row.value;
            return `
                <div class="chart-row">
                    <div class="text-sm font-medium text-gray-700">${row.label}</div>
                    <div class="progress-track">
                        <div class="progress-fill" style="width:${width}%"></div>
                    </div>
                    <div class="text-sm text-right text-gray-500">${valueText}</div>
                </div>
            `;
        }).join('');
    }

    window.EleganceReports = {
        renderBarChart
    };
})();
