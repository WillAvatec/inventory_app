// Define global variables
const imgElement = document.querySelector(".item-image-container img");
const imgInput = document.querySelector(".img-input");
const paragraph = document.querySelector(".item-image-container p");

async function updateImageDisplay() {
  if (imgInput.files.length === 0) return;
  const file = imgInput.files[0];
  if (file.size > 10485760) return alert("File size at max must be 10MB.");
  paragraph.textContent = "Uploading...";
  const imgurLink = await uploadImgOnImgur(file);
  imgElement.src = URL.createObjectURL(file);
  paragraph.style.display = "none";
}

/* Been throwing 403 status for a while by now */

async function uploadImgOnImgur(file) {
  // Add authorization Header (requested by Imgur)
  const CLIENT_ID = "8927cb9c78a15b7";
  const myHeaders = new Headers();
  myHeaders.append("Authorization", `Client-ID ${CLIENT_ID}`);
  // Add img to a FormData (to post in the body of request)
  const formData = new FormData();
  formData.append("image", file);

  const requestOptions = {
    method: "POST",
    headers: myHeaders,
    body: formData,
    redirect: "follow",
  };

  return fetch("https://api.imgur.com/3/image", requestOptions)
    .then((res) => res.text())
    .then((text) => {
      const response = JSON.parse(text);
      if (response.status === 403) throw new Error(response.data.error);
      return response.data.link;
    })
    .catch((err) => console.log("error", err));
}

// Add listener to input
imgInput.addEventListener("change", updateImageDisplay);
