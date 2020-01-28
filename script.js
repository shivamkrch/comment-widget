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
  replyBtn.classList.add("reply-btn");
  let deleteBtn = document.createElement("button");
  deleteBtn.textContent = "Delete";
  deleteBtn.onclick = onDeleteComment;
  deleteBtn.classList.add("delete-btn");
  let commentTime = document.createElement("small");
  commentTime.textContent = parseDate(comment.id);
  let replies = document.createElement("div");
  replies.classList.add("replies");
  replies.id = "replies-" + comment.id;
  commentDiv.append(commentText, replyBtn, deleteBtn, commentTime, replies);
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
      console.error("unable to insert");
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
  replyForm = getCommentForm(el.getAttribute("comment-id"));
  el.children[4].append(replyForm);
  replyForm.children[0].focus();
  e.target.remove();
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

function deleteComment(comments, delId) {
  for (let i = 0; i < comments.length; i++) {
    if (comments[i].id == delId) {
      comments.splice(i, 1);
      return 1;
    } else if (comments[i].replies.length) {
      if (deleteComment(comments[i].replies, delId)) {
        return 1;
      }
    }
  }
  return 0;
}

function onDeleteComment(e) {
  let delId = parseInt(e.target.parentElement.getAttribute("comment-id"));
  if (deleteComment(comments, delId)) {
    e.target.parentElement.onanimationend = e => {
      e.target.remove();
    };
    e.target.parentElement.style.animation = "fade-out .8s 1";
  } else {
    console.error("delete failed");
  }
}

function renderComments(root, comments) {
  for (comment of comments) {
    let newDiv = getCommentDiv(comment);
    root.prepend(newDiv);
    if (comment.replies.length) {
      renderComments(newDiv.children[4], comment.replies);
    }
  }
}

function parseDate(date) {
  let diff = (Date.now() - date) / 1000;
  if (diff < 60) {
    return "Just now";
  } else if (diff < 60 * 60) {
    let d = parseInt(diff / 60);
    if (d > 1) {
      return d + " mins ago";
    }
    return d + " min ago";
  } else if (diff < 24 * 60 * 60) {
    let d = parseInt(diff / (60 * 60));
    if (d > 1) {
      return d + " hours ago";
    }
    return d + " hour ago";
  } else if (diff < 2 * 24 * 60 * 60) {
    return "Yesterday";
  } else {
    return new Date(comment.id).toLocaleString("en-IN", {
      dateStyle: "medium",
      timeStyle: "short"
    });
  }
}

window.onload = e => {
  if (localStorage.getItem("comments"))
    comments = JSON.parse(localStorage.getItem("comments"));
  rootDiv = document.getElementById("comments");

  renderComments(rootDiv, comments);

  document.querySelector("form").onsubmit = addComment;

  setInterval(() => {
    document.querySelectorAll(".comment small").forEach(el => {
      let time = el.parentElement.getAttribute("comment-id");
      el.textContent = parseDate(parseInt(time));
    });
    console.log("updated");
  }, 60 * 1000);
};

window.onunload = e => {
  localStorage.setItem("comments", JSON.stringify(comments));
};
