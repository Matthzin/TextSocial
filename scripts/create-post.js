document
  .getElementById("createPostForm")
  .addEventListener("submit", function (event) {
    event.preventDefault();
    const postContent = document.getElementById("postContent").value;
    const newPostId = Date.now().toString();
    axios
      .post("http://localhost:3000/posts", {
        id: newPostId,
        userId: "1",
        content: postContent,
        comments: [],
        likes: 0,
      })
      .then((response) => {
        const modal = bootstrap.Modal.getInstance(
          document.getElementById("createPostModal")
        );
        modal.hide();
        document.getElementById("createPostForm").reset();
      })
      .catch((error) => {
        console.error("Erro ao criar postagem:", error);
      });
  });