// quotes
const quotes = [
  "When you have eliminated the impossible, whatever remains, however improbable, must be the truth.",
  "There is nothing more deceptive than an obvious fact.",
  "I ought to know by this time that when a fact appears to be opposed to a long train of deductions it invariably proves to be capable of bearing some other interpretation.",
  "I never make exceptions. An exception disproves the rule.",
  "What one man can invent another can discover.",
  "Nothing clears up a case so much as stating it to another person.",
  "Education never ends, Watson. It is a series of lessons, with the greatest for the last.",
];

// lưu trữ danh sách các từ và index của từ hiện tại mà người chơi đang gõ
let words = [];
let wordIndex = 0;
// lưu trữ thời gian bắt đầu
let startTime = Date.now();
//page elements
const quoteElement = document.getElementById("quote");
const messageElement = document.getElementById("message");
const typedValueElement = document.getElementById("typed-value");
const modalElement = new bootstrap.Modal("#exampleModal");

// hàm xử lý sự kiện nhấp vào nút start
const handleButtonStartOnclick = () => {
  typedValueElement.removeAttribute("disabled");

  // lấy 1 quotes ngẫu nhiên trong danh sách quotes
  const quoteIndex = Math.floor(Math.random() * quotes.length);
  const quote = quotes[quoteIndex];
  // tách các từ trong quote vào một mảng các từ, để có thể theo dõi từ hiện tại mà người chơi đang gõ
  words = quote.split(" ");
  // reset index của từ hiện tại vì người chơi bắt đầu gõ từ từ đầu tiên
  wordIndex = 0;

  // cập nhật UI
  // Tạo 1 mảng các span chứa các từ để có thể đặt 1 class, cho phép highlight từ hiện tại
  const spanWords = words.map(function (word) {
    return `<span>${word} </span>`;
  });
  // Chuyển đổi thành chuỗi và đặt làm innerHTML hiển thị quote
  quoteElement.innerHTML = spanWords.join("");
  // highlight từ đầu tiên, vì người chơi bắt đầu gõ từ từ đầu tiên
  quoteElement.childNodes[0].className = "highlight";
  // Xóa mọi messeage trc đó
  messageElement.innerText = "";

  // Cài đặt textbox
  // Clear the textbox
  typedValueElement.value = "";
  // đặt focus
  typedValueElement.focus();
  // đặt eventHandler

  // băt đầu đếm thời gian
  startTime = new Date().getTime();

  // thêm sự kiện khi gõ vào textbox
  typedValueElement.addEventListener("input", handleInputTypedValue);
};

// hàm xử lý sự kiện khi gõ vào ô input
const handleInputTypedValue = () => {
  // lấy từ hiện tại mà người chơi cần gõ
  const currentWord = words[wordIndex];
  // lấy giá trị ô text mà người chơi đang gõ
  const typedValue = typedValueElement.value;

  if (typedValue === currentWord && wordIndex === words.length - 1) {
    // kết thúc quote
    // Hiển thị chúc mừng hoàn thành màn chơi và thời gian chơi
    const elapsedTime = new Date().getTime() - startTime;
    // tính ra điểm cao nhất và lưu vào localStorage
    let highScore = storeHighScore(elapsedTime / 1000);
    const message = `Chúc mừng bạn đã hoàn thành màn chơi trong ${
      elapsedTime / 1000
    } giây.\nĐiểm số cao nhất: ${highScore} giây.`;
    messageElement.innerText = message; // khi innerText dc gọi, nó sẽ thay thế luôn thành phần đó;
    typedValueElement.value = "";
    typedValueElement.setAttribute("disabled", true);
    //hiển thị modal
    showModal(message);
    typedValueElement.removeEventListener("input", handleInputTypedValue);
  } else if (typedValue.endsWith(" ") && typedValue.trim() === currentWord) {
    //hàm trim chỉ loại bỏ khoảng trắng ở đầu và cuối chuỗi
    // kết thúc word
    // clear giá trị của typedValueElement để gõ từ mới
    typedValueElement.value = "";
    // chuyển tới từ tiếp theo
    wordIndex++;
    // reset className cho tất cả các elements trong quotes
    for (const wordElement of quoteElement.childNodes) {
      wordElement.className = "";
    }
    // highlight từ tiếp theo
    quoteElement.childNodes[wordIndex].className = "highlight";
  } else if (currentWord.startsWith(typedValue)) {
    // hiện tại đang gõ đúng
    // highlight từ tiếp theo
    typedValueElement.className = "";
  } else {
    // có lỗi xảy ra
    typedValueElement.className = "error";
  }
};

// thêm sự kiện khi nhấn phím start
document
  .getElementById("start")
  .addEventListener("click", handleButtonStartOnclick);

// Disable the input event listener on completion, and re-enable it when the button is clicked

// Display a modal dialog box with the success message
const showModal = (msg) => {
  document.getElementById("modal-msg").textContent = msg;
  modalElement.show();
};

// Store high scores using localStorage
// điểm số ở đây là thời gian, do đó cần lưu kỉ lục nhỏ nhất
const storeHighScore = (score) => {
  let highScore = localStorage.getItem("highScore");
  if (!highScore || highScore > score) {
    localStorage.setItem("highScore", score);
    return score;
  } else {
    return highScore;
  }
};
