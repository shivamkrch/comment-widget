var comments = [],
  rootDiv;

function getCommentForm(id) {
  id = parseInt(id);
  let commentForm = document.createElement("form");
  commentForm.setAttribute("comment-id", id);
  commentForm.onsubmit = addComment;
  commentForm.appendChild(document.createElement("input"));
  commentForm.children[0].setAttribute("required", "");
  commentForm.children[0].setAttribute("type", "text");
  let postBtn = document.createElement("input");
  postBtn.value = "Post";
  postBtn.type = "Submit";
  postBtn.classList.add("post-btn");
  commentForm.appendChild(postBtn);
  return commentForm;
}

function getCommentDiv(comment) {
  let commentDiv = document.createElement("div");
  commentDiv.classList.add("comment");
  commentDiv.id = "comment-" + comment.id;
  commentDiv.setAttribute("comment-id", comment.id);
  let commentText = document.createElement("p");
  commentText.textContent = comment.text;
  let replyBtn = document.createElement("button");
  replyBtn.textContent = "Reply";
  replyBtn.onclick = insertReplyForm;
  let commentTime = document.createElement("small");
  commentTime.textContent = new Date(comment.id).toLocaleString();
  let replies = document.createElement("div");
  replies.classList.add("replies");
  replies.id = "replies-" + comment.id;
  commentDiv.append(commentText, replyBtn, commentTime, replies);
  return commentDiv;
}

function addComment(e) {
  e.preventDefault();

  let commId = e.target.getAttribute("comment-id");
  let newComment = {
    id: Date.now(),
    text: e.target.elements[0].value,
    replies: []
  };
  e.target.elements[0].value = "";
  let commentDiv = getCommentDiv(newComment);
  if (!commId) {
    comments.unshift(newComment);
    rootDiv.append(commentDiv);
  } else {
    if (
      !addReply(
        comments,
        newComment,
        parseInt(e.target.getAttribute("comment-id"))
      )
    ) {
      console.log("unable to insert");
    }
    e.target.before(commentDiv);
  }
  e.target.children[0].focus();
}

function insertReplyForm(e) {
  e.preventDefault();

  let el = e.target.parentElement;
  let replyForm = document.querySelector(
    'form[comment-id="' + el.getAttribute("comment-id") + '"]'
  );
  if (replyForm) {
    replyForm.children[0].focus({});
    return;
  }
  replyForm = getCommentForm(el.getAttribute("comment-id"));
  el.children[3].append(replyForm);
  replyForm.children[0].focus();
}

function addReply(comments, reply, parentCommentId) {
  for (comment of comments) {
    if (comment.id == parentCommentId) {
      comment.replies.unshift(reply);
      return 1;
    } else if (comment.replies.length) {
      if (addReply(comment.replies, reply, parentCommentId)) {
        return 1;
      }
    }
  }
  return 0;
}

function renderComments(root, comments) {
  for (comment of comments) {
    let newDiv = getCommentDiv(comment);
    root.prepend(newDiv);
    if (comment.replies.length) {
      renderComments(newDiv.children[3], comment.replies);
    }
  }
}

window.onload = e => {
  if (localStorage.getItem("comments"))
    comments = JSON.parse(localStorage.getItem("comments"));
  rootDiv = document.getElementById("comments");

  renderComments(rootDiv, comments);

  document.querySelector("form").onsubmit = addComment;
};

window.onunload = e => {
  localStorage.setItem("comments", JSON.stringify(comments));
};
