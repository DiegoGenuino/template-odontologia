(() => {
const reviewTrack = document.querySelector(".review-track");
      if (reviewTrack && reviewTrack.querySelector(".review-card")) {
        const moveReview = (direction) =>
          reviewTrack.scrollBy({
            left:
              direction *
              (reviewTrack.querySelector(".review-card").getBoundingClientRect()
                .width +
                16),
            behavior: "smooth",
          });
        document
          .querySelector(".review-prev")
          .addEventListener("click", () => moveReview(-1));
        document
          .querySelector(".review-next")
          .addEventListener("click", () => moveReview(1));
      }
})();
