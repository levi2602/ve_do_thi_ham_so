const aSlider = document.getElementById('a-slider');
const aValueSpan = document.getElementById('a-value');
const canvas = document.getElementById('graph');
const ctx = canvas.getContext('2d');
const pointsTable = document.getElementById('points-table').getElementsByTagName('tbody')[0];
const graphTable = document.getElementById('graph-table').getElementsByTagName('tbody')[0];
const addRowButton = document.getElementById('add-row');
const addGraphButton = document.getElementById('add-graph');
const resetButton = document.getElementById('reset-btn');

// Khởi tạo giá trị a và vẽ đồ thị
let a = parseFloat(aSlider.value);
aValueSpan.textContent = a;
drawGraph(a);

// Sự kiện thay đổi giá trị của a
aSlider.addEventListener('input', function () {
  a = parseFloat(aSlider.value);
  aValueSpan.textContent = a;
  drawGraph(a);
  plotPoints(); // Vẽ lại các điểm sau khi thay đổi a
});

// Vẽ mặt phẳng Oxy
function drawGraph(a) {
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  const range = a * 10;
  const origin = { x: canvas.width / 2, y: canvas.height / 2 };
  const scale = canvas.width / (range * 2);

  // Vẽ trục Oxy
  ctx.beginPath();
  ctx.moveTo(0, origin.y);
  ctx.lineTo(canvas.width, origin.y); // Trục x
  ctx.moveTo(origin.x, 0);
  ctx.lineTo(origin.x, canvas.height); // Trục y
  ctx.stroke();

  // Vẽ mũi tên chỉ hướng
  ctx.fillText("x", canvas.width - 10, origin.y - 10);
  ctx.fillText("y", origin.x + 10, 10);

  // Hiển thị chỉ số trên trục với độ chia nhỏ nhất là 1
  for (let i = -range; i <= range; i++) {
    const xCoord = origin.x + i * (canvas.width / (range * 2));
    const yCoord = origin.y - i * (canvas.width / (range * 2));

    // Đánh dấu các chỉ số trên trục x
    if (i % 1 === 0) { // Chỉ vẽ với độ chia nhỏ nhất là 1
      ctx.fillText(i, xCoord, origin.y + 10);
      ctx.fillRect(xCoord, origin.y - 2, 1, 4);
    }

    // Đánh dấu các chỉ số trên trục y
    if (i % 1 === 0) { // Chỉ vẽ với độ chia nhỏ nhất là 1
      ctx.fillText(i, origin.x + 10, yCoord);
      ctx.fillRect(origin.x - 2, yCoord, 4, 1);
    }
  }
}

// Vẽ đồ thị hàm số
function plotGraphs() {
  const origin = { x: canvas.width / 2, y: canvas.height / 2 };
  const scale = canvas.width / (a * 20);
  ctx.clearRect(0, 0, canvas.width, canvas.height); // Xóa đồ thị cũ

  // Vẽ lại mặt phẳng Oxy
  drawGraph(a);

  Array.from(graphTable.rows).forEach(row => {
    const graphName = row.cells[0].firstElementChild.value;
    let equation = row.cells[1].firstElementChild.value;

    // Thay thế các phép nhân không có dấu "*"
    equation = equation.replace(/([a-zA-Z0-9]+)\s*\*\s*([a-zA-Z0-9]+)/g, '$1*$2');
    equation = equation.replace(/([a-zA-Z0-9]+)(?=\s*[a-zA-Z])/g, '$1*'); // Thêm dấu "*" khi có biến đi sau
    equation = equation.replace(/([a-zA-Z0-9]+)(?=\s*\()/g, '$1*'); // Thêm dấu "*" khi có hàm số

    // Kiểm tra hàm số hợp lệ không
    try {
      const fn = new Function('x', `return ${equation};`);
      ctx.beginPath();
      for (let x = -a * 10; x <= a * 10; x += 0.1) {
        const y = fn(x);
        const xCoord = origin.x + x * scale;
        const yCoord = origin.y - y * scale;

        if (x === -a * 10) {
          ctx.moveTo(xCoord, yCoord);
        } else {
          ctx.lineTo(xCoord, yCoord);
        }
      }
      ctx.stroke();
      ctx.fillText(graphName, origin.x + 5, origin.y - fn(0) * scale - 5); // Hiển thị tên đồ thị
    } catch (error) {
      console.log('Hàm số không hợp lệ:', equation);
    }
  });
}

// Thêm hàng mới cho bảng đồ thị
addGraphButton.addEventListener('click', function () {
  const newRow = graphTable.insertRow();

  const nameCell = newRow.insertCell(0);
  const equationCell = newRow.insertCell(1);
  const deleteCell = newRow.insertCell(2); // Cột chứa nút xóa

  // Tạo các ô input cho người dùng nhập tên và hàm số
  nameCell.innerHTML = `<input type="text" placeholder="Tên đồ thị">`;
  equationCell.innerHTML = `<input type="text" placeholder="Hàm số (ví dụ: x*x)">`;
  deleteCell.innerHTML = `<button class="delete-graph-btn">Xóa</button>`; // Nút xóa đồ thị

  // Xử lý sự kiện xóa đồ thị
  deleteCell.firstElementChild.addEventListener('click', function () {
    newRow.remove(); // Xóa hàng tương ứng
    plotGraphs(); // Vẽ lại các đồ thị sau khi xóa
  });

  // Lưu hàm số và tên đồ thị khi nhấn nút
  const plotButton = document.createElement('button');
  plotButton.textContent = 'Vẽ đồ thị';
  nameCell.appendChild(plotButton);

  plotButton.addEventListener('click', function () {
    plotGraphs(); // Vẽ đồ thị chỉ khi nhấn nút
  });
});

// Thêm hàng mới vào bảng điểm
addRowButton.addEventListener('click', function () {
  const newRow = pointsTable.insertRow();

  const nameCell = newRow.insertCell(0);
  const xCell = newRow.insertCell(1);
  const yCell = newRow.insertCell(2);
  const deleteCell = newRow.insertCell(3); // Cột chứa nút xóa

  // Tạo các ô input cho người dùng nhập tên và tọa độ
  nameCell.innerHTML = `<input type="text" placeholder="Tên điểm">`;
  xCell.innerHTML = `<input type="number" placeholder="Tọa độ x">`;
  yCell.innerHTML = `<input type="number" placeholder="Tọa độ y">`;
  deleteCell.innerHTML = `<button class="delete-btn">Xóa</button>`; // Nút xóa điểm

  // Khi thay đổi giá trị tọa độ, vẽ lại điểm
  [xCell.firstElementChild, yCell.firstElementChild].forEach(input => {
    input.addEventListener('input', plotPoints);
  });

  // Xử lý sự kiện xóa điểm
  deleteCell.firstElementChild.addEventListener('click', function () {
    newRow.remove(); // Xóa hàng tương ứng
    plotPoints(); // Vẽ lại các điểm sau khi xóa
  });
});

// Vẽ lại các điểm trên Oxy
function plotPoints() {
  const origin = { x: canvas.width / 2, y: canvas.height / 2 };
  const scale = canvas.width / (a * 20);
  ctx.clearRect(0, 0, canvas.width, canvas.height); // Xóa điểm cũ
  drawGraph(a); // Vẽ lại mặt phẳng Oxy

  Array.from(pointsTable.rows).forEach(row => {
    const pointName = row.cells[0].firstElementChild.value;
    const xValue = parseFloat(row.cells[1].firstElementChild.value);
    const yValue = parseFloat(row.cells[2].firstElementChild.value);

    if (!isNaN(xValue) && !isNaN(yValue)) {
      const xCoord = origin.x + xValue * (canvas.width / (a * 20));
      const yCoord = origin.y - yValue * (canvas.width / (a * 20));

      // Vẽ điểm
      ctx.fillStyle = 'red';
      ctx.beginPath();
      ctx.arc(xCoord, yCoord, 3, 0, Math.PI * 2); // Kích thước điểm nhỏ hơn
      ctx.fill();
      ctx.fillStyle = 'black';
      ctx.fillText(pointName, xCoord + 5, yCoord); // Hiển thị tên điểm
    }
  });
}

// Xoá tất cả điểm và bảng
resetButton.addEventListener('click', function () {
  pointsTable.innerHTML = '';
  drawGraph(a);
});
