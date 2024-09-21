function displayPost(post, users) {
  if (!users || !Array.isArray(users)) {
    console.error("Error: users array is not defined or not an array");
    return;
  }

  const user = users.find((user) => user.id === post.userId);

  const likesCount = post.likes || 0;

  const postHtml = `
  <div class="card mb-4">
     <div class="card-body">
        <div class="d-flex align-items-center mb-2">
           <img src="${user?.profilePic || "images/default-avatar.jpg"}" alt="Profile Picture" class="rounded-circle me-2" width="40" height="40">
           <strong>${user ? user.username : "Usuário desconhecido"}</strong>
        </div>
        <p>${post.content}</p>
        <button class="btn btn-link" onclick="toggleLike(${post.id}, ${likesCount})">
        <img id="like-btn-${post.id}" src="${post.likes && post.likes > 0? "images/like-filled.png": "images/like-unfilled.png"}" width="27" height="27" alt="Like Button"></button>
        <span id="like-count-${post.id}">${likesCount} like${likesCount !== 1 ? "s" : ""}</span>
        <div id="comments-${post.id}" class="mt-3">
           <p><strong>Comentários:</strong></p>
           <ul class="list-group mb-3" id="comments-list-${post.id}">
              ${post.comments.slice(0, 3).map((comment) =>
                    `
              <li class="list-group-item">${comment}</li>`).join("")}
           </ul>
           ${post.comments.length > 3? `<button class="btn btn-link" onclick="loadMoreComments('${post.id}')">Exibir mais comentários</button>`: ""}
           <div class="input-group mt-2">
              <input type="text" class="form-control" placeholder="Adicionar um comentário" id="comment-input-${post.id}">
              <button class="btn btn-outline-secondary" type="button" onclick="addComment('${post.id}')">Comment</button>
           </div>
        </div>
     </div>
  </div>
  `;
  document
    .getElementById("postsContainer")
    .insertAdjacentHTML("beforeend", postHtml);
}

function toggleLike(postId, currentLikes) {
  const likeBtn = document.getElementById(`like-btn-${postId}`);
  const likeCountElement = document.getElementById(`like-count-${postId}`);
  let currentLikeCount = currentLikes;

  const isLiked = likeBtn.getAttribute("src") === "images/like-filled.png";

  if (isLiked) {
    currentLikeCount = Math.max(currentLikeCount - 1, 0);
    likeBtn.setAttribute("src", "images/like-unfilled.png"); 
  } else {
    currentLikeCount += 1;
    likeBtn.setAttribute("src", "images/like-filled.png");
  }

  likeCountElement.textContent = `${currentLikeCount} like${
    currentLikeCount !== 1 ? "s" : ""
  }`;

  axios
    .patch(`http://localhost:3000/posts/${postId}`, { likes: currentLikeCount })
    .catch((error) => {
      console.error("Erro ao atualizar likes:", error);
    });
}


function loadMoreComments(postId) {
  axios.get(`http://localhost:3000/posts/${postId}`).then((response) => {
    const post = response.data;
    const commentList = document.getElementById(`comments-list-${postId}`);
    const currentComments = commentList.querySelectorAll("li").length;
    const moreComments = post.comments.slice(
      currentComments,
      currentComments + 3
    );

    moreComments.forEach((comment) => {
      commentList.insertAdjacentHTML(
        "beforeend",
        `<li class="list-group-item">${comment}</li>`
      );
    });

    if (currentComments + 3 >= post.comments.length) {
      const moreBtn = document.querySelector(`#comments-${postId} button`);
      moreBtn.style.display = "none";
    }
  });
}

function addComment(postId) {
  const commentInput = document.getElementById(`comment-input-${postId}`);
  const comment = commentInput.value;

  if (comment) {
    axios
      .get(`http://localhost:3000/posts/${postId}`)
      .then((response) => {
        const updatedComments = [...response.data.comments, comment];

        axios
          .patch(`http://localhost:3000/posts/${postId}`, {
            comments: updatedComments,
          })
          .then(() => {
            const commentList = document.getElementById(
              `comments-list-${postId}`
            );
            commentList.insertAdjacentHTML(
              "beforeend",
              `<li class="list-group-item">${comment}</li>`
            );
            commentInput.value = "";
          })
          .catch((error) => {
            console.error("Erro ao atualizar o post:", error);
          });
      })
      .catch((error) => {
        console.error("Erro ao buscar o post:", error);
      });
  }
}

axios
  .get("http://localhost:3000/posts")
  .then((postResponse) => {
    axios
      .get("http://localhost:3000/users")
      .then((userResponse) => {
        const users = userResponse.data;

        if (!users || !Array.isArray(users)) {
          console.error("Error: Could not retrieve users");
          return;
        }

        const posts = postResponse.data;

        posts.forEach((post) => {
          displayPost(post, users);
        });
      })
      .catch((error) => {
        console.error("Error fetching users:", error);
      });
  })
  .catch((error) => {
    console.error("Error fetching posts:", error);
  });
