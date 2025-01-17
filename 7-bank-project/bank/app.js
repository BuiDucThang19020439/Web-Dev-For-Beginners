const baseUrl = "http://localhost:5000/api/";
const storageKey = "savedAccount";
let state = Object.freeze({
  account: null,
});

// danh sách các route
const routes = {
  "/login": { templateId: "login" },
  "/dashboard": { templateId: "dashboard", init: refresh },
  "/credit": { templateId: "credit" },
};

// đối số thứ 2 là
/**
 * hàm điều hướng đến route cụ thể
 * dòng đầu tiên dùng để quay lại lịch sử mà ko cần tải lại toàn bộ trang
 * đối số thứ 1 đại điện cho đối tượng state, có thể chứa bất kỳ dữ liệu nào mà ta muốn liên kết với lịch sử.
 *      Ở đây là {} trống, tức là ko có kiểu dữ liệu cụ thể nào được lưu trữ
 * đối số thú 2 là đường dẫn URL mới sẽ hiển thị trên thanh tìm kiếm
 * đối số thứ 3 là tiêu đề của document mới
 * @param path đường dẫn tương đối, ở đây là key của routes obj
 */
function navigate(path) {
  window.history.pushState({}, path, path);
  updateRoute();
}

// update state
const updateState = (property, newData) => {
  state = Object.freeze({
    ...state,
    [property]: newData,
  });
  console.log("state: ");
  console.log(state);
  localStorage.setItem(storageKey, JSON.stringify(state.account));
};

/**
 * Hàm này truy xuất phần tử trong DOM bằng getElementById; sau đó clone nội dung của nó vào app Placeholder
 * window.location.pathname cho phép thiết lập hoặc lấy ra đường đẫn hiện tại của trang web,
 * ko bao gồm tên miền và các tham số
 * Lưu ý: cloneNode(true): clone node và cả những con của nó; nếu false thì chỉ clone node thôi.
 */
function updateRoute() {
  const path = window.location.pathname;
  const route = routes[path];
  if (!route) {
    return navigate("/login");
  }

  const template = document.getElementById(route.templateId);
  const view = template.content.cloneNode(true);
  const app = document.getElementById("app");
  app.innerHTML = " ";
  app.appendChild(view);

  if (typeof route.init === "function") {
    route.init();
  }

  document.title = route.templateId.toUpperCase();
}

/**
 * Hàm đăng ký truy xuất element registerForm. Sử dụng formData để trích xuất các giá trị được của input dưới
 * dạng cặp key:value. Sau đó convert formData thành Object thông thường
 */
const register = async () => {
  const registerForm = document.getElementById("registerForm");
  const formData = new FormData(registerForm);
  const response = await createAccount(Object.fromEntries(formData));
  if (response.status >= 400) {
    console.log("Có lỗi xảy ra: ");
    console.log(response.data.error);
    return updateElement(
      "registerError",
      "Có lỗi xảy ra: " + response.data.error
    );
  } else {
    console.log("Đăng ký thành công");
    console.log(response.data);
  }
  updateState("account", response.data);
  navigate("/dashboard");
};

/**
 * api đăng ký tài khoản mới
 */
const createAccount = async (account) => {
  try {
    return await axios.post(baseUrl + "accounts", {
      user: account.user,
      currency: account.currency,
      description: account.description,
      balance: account.balance,
    });
  } catch (error) {
    return error.response;
  }
};

/**
 * Hàm đăng nhập
 */
const login = async () => {
  const loginForm = document.getElementById("loginForm");
  const user = loginForm.user.value;
  const response = await getAccount(user);
  if (response.status >= 400) {
    console.log("Có lỗi xảy ra: ");
    console.log(response.data.error);
    return updateElement("loginError", "Có lỗi xảy ra: " + response.data.error);
  } else {
    updateState("account", response.data);
    navigate("/dashboard");
  }
};

/**
 * api đăng nhập
 */
const getAccount = async (user) => {
  try {
    const response = await axios.get(
      baseUrl + "accounts/" + encodeURIComponent(user)
    );
    return response;
  } catch (error) {
    return error.response;
  }
};

// Cập nhật 1 element
const updateElement = (id, textOrNode) => {
  const element = document.getElementById(id);
  if (element) {
    element.textContent = ""; // xóa bỏ mọi content trc khi thêm;
    element.append(textOrNode); // append cho phép đính kèm text or DOM node vào phần tử gốc
  }
};

// update dashboard
function updateDashboard() {
  const account = state.account;
  if (!account) {
    return logout();
  }
  updateElement("description", account.description);
  updateElement("balance", Number(account.balance).toFixed(2));
  updateElement("currency", account.currency);

  // tạo ra DOM mới để làm việc trên đó trc khi gắn vào html DOM
  const transactionsRows = document.createDocumentFragment();
  for (const transaction of account.transactions) {
    const transactionRow = createTransactionRow(transaction);
    transactionsRows.appendChild(transactionRow);
  }
  // update cho tbody
  updateElement("transactions", transactionsRows);
}

// tao transaction moi
function createTransactionRow(transaction) {
  const template = document.getElementById("transaction");
  const transactionRow = template.content.cloneNode(true);
  const tr = transactionRow.querySelector("tr");
  tr.children[0].textContent = transaction.date;
  tr.children[1].textContent = transaction.object;
  tr.children[2].textContent = transaction.amount.toFixed(2);
  return transactionRow;
}

// hàm đăng xuất
const logout = () => {
  updateState("account", null);
  navigate("/login");
};

// hàm cập nhật dữ liệu tài khoản. nếu dữ liệu ko hợp lệ thì logout, nếu đúng thì cập nhật
async function updateAccountData() {
  const account = state.account;
  if (!account) {
    return logout();
  }
  const data = await getAccount(account.user);
  if (data.error) {
    return logout();
  }
  updateState("account", data.data);
}

// hiện dialog thêm giao dịch
const showAddTransactionForm = () => {
  document.getElementById("dialog-background").style.display = "block";
  document.getElementById("dialog-content").style.visibility = "visible";
};

// đóng dialog thêm giao dịch
const hideAddTransactionForm = () => {
  document.getElementById("dialog-background").style.display = "none";
  document.getElementById("dialog-content").style.visibility = "hidden";
};
// hàm submit một giao dịch
const commitTransaction = async() => {
  const dialogForm = document.getElementById('dialog-form');
  const formData = new FormData(dialogForm);
  const response = await createNewTransaction(Object.fromEntries(formData))
  if(response.status >= 400) {
    console.log('Có lỗi xảy ra: ');
    console.log(response.data.error);
    return updateElement(
      "transactionError",
      "Có lỗi xảy ra: " + response.data.error
    )
  } else {
    console.log('giao dịch thành công');
    console.log(response.data)
  }
  let newState = state.account;
  newState.transactions.push(response.data);
  updateState("account", newState);
  navigate("/dashboard")
}

const createNewTransaction = async(transaction) => {
  try {
    return await axios.post(`${baseUrl}accounts/${state.account.user}/transactions`, {
      date: transaction.date,
      object: transaction.object,
      amount: transaction.amount
    })
  } catch (error) {
    return error.response;
  }
}

async function refresh() {
  await updateAccountData();
  updateDashboard();
}

//Đảm bảo template dc gọi khi lịch sử trình duyệt thay đổi
function init() {
  const savedAccount = JSON.parse(localStorage.getItem(storageKey));
  if (savedAccount) {
    updateState("account", savedAccount);
  }
  window.onpopstate = () => updateRoute();
  updateRoute();
}
init();
