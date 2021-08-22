const refs = {
  commentsList: document.querySelector(".comments-list"),
  container: document.querySelector(".container"),
  form: document.querySelector(".form"),
  formBtn: document.querySelector(".form-btn"),
  inputName: document.querySelector(".input-name"),
  inputComment: document.querySelector(".input-comment"),
  checkSpamBtn: document.querySelector(".spam"),
};

window.addEventListener("DOMContentLoaded", onLoadPage);
refs.form.addEventListener("submit", sendData);
refs.commentsList.addEventListener("click", onDeleteComment);
refs.checkSpamBtn.addEventListener("click", onCheckSpam);

// функция переключения со спама на обычные комменты и наоборот
function onCheckSpam(e) {
  e.target.textContent = "Check comments";
  if (e.target.dataset.checked) {
    e.target.dataset.checked = "";
    e.target.textContent = "Check spam";
    onLoadPage(e, false);
    return;
  }
  e.target.dataset.checked = "true";
  onLoadPage(e, true);
}

// функция удаления комментов
async function onDeleteComment(e) {
  if (e.target.nodeName !== "BUTTON") {
    return;
  }
  await fetch(
    `https://61222a8ff5849d0017fb440b.mockapi.io/api/v1/comments/${e.target.id}`,
    {
      method: "DELETE",
    }
  );
  onLoadPage();
}

// функция отправки данных на сервер и обновления ui
async function sendData(e) {
  e.preventDefault();
  const name = refs.inputName.value;
  const comment = refs.inputComment.value;
  const data = {
    name,
    comment,
  };
  const resp = await fetch(
    "https://61222a8ff5849d0017fb440b.mockapi.io/api/v1/comments",
    {
      method: "POST",
      body: JSON.stringify({
        ...data,
      }),
      headers: {
        "Content-Type": "application/json",
      },
    }
  );
  if (resp.status === 201) {
    reset(refs.inputComment, refs.inputName);
    onLoadPage();
  }
}

// функция которая рендерит список после загрузки дома
async function onLoadPage(e, flag) {
  const response = await fetch(
    "https://61222a8ff5849d0017fb440b.mockapi.io/api/v1/comments"
  );
  const data = await response.json();
  const withoutSpam = data.filter(({ comment }) => {
    return (
      !comment.toLowerCase().includes("spam") &&
      !comment.toLowerCase().includes("sale")
    );
  });
  if (flag) {
    const withSpam = data.filter(({ comment }) => {
      return (
        comment.toLowerCase().includes("spam") ||
        comment.toLowerCase().includes("sale")
      );
    });
    renderComments(createTemplate, withSpam);
    return;
  }
  renderComments(createTemplate, withoutSpam);
}

// функция для рендера комментов
function renderComments(callback, data) {
  const markup = callback(data);
  refs.commentsList.innerHTML = markup;
}

// функция для создания разметки списка
function createTemplate(data) {
  return data
    .map(({ comment, name, id }) => {
      return `<li>
        <h3>${name}</h3>
        <p>${comment}</p>
        <button id="${id}" class="delete">delete</button>
        </li>`;
    })
    .join("");
}

// reset полей формы
function reset(...nodes) {
  [...nodes].forEach((el) => {
    el.value = "";
  });
}