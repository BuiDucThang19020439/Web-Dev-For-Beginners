const baseUrl = 'http://localhost:5000/api/';

// danh sách các route
const routes = {
  "/login": { templateId: "login" },
  "/dashboard": { templateId: "dashboard" },
  "/credit": {templateId: "credit"}
};

// 
// 
// 
// đối số thú 2 là 
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
}

// Ngăn chặn hành vi mặc định của sự kiện
// Click vào link sẽ điều hướng đến trang tương ứng
function onLinkClick(event) {
  event.preventDefault();
  navigate(event.target.href);
}

/**
 * Hàm đăng ký truy xuất element registerForm. Sử dụng formData để trích xuất các giá trị được của input dưới
 * dạng cặp key:value. Sau đó convert formData thành Object thông thường và chuyển đổi nó thành JSON để 
 * trao đổi dữ liệu trên web
 */
const register = async() => {
  const registerForm = document.getElementById('registerForm');
  const formData = new FormData(registerForm);
  const jsonData = JSON.stringify(Object.fromEntries(formData));
  const response = await createAccount(jsonData);
  if(response) {
    console.log("Đăng ký thành công")
    console.log(response.data);
  }
}

/**
 * api đăng ký tài khoản mới
 *  
 */

const createAccount = async(data) => {
  const account = JSON.parse(data);
  try {
    return await axios.post(baseUrl + 'accounts', {
      user: account.user,
      currency: account.currency,
      description: account.description,
      balance: account.balance
    })
  } catch (error) {
    console.log(error)
  }
}

//Đảm bảo template dc gọi khi lịch sử trình duyệt thay đổi
window.onpopstate = () => updateRoute();
updateRoute();