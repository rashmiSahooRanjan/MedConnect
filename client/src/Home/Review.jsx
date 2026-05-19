import React, { useMemo, useState } from "react";
import { Link, useLocation } from "react-router-dom";

const allReviews = [
  {
    id: 1,
    stars: 5,
    title: "Excellent Consultation",
    text: "Dr. Sharma was very attentive and explained everything clearly. Highly recommend!",
    reviewer: "Rahul S.",
    reviewerId: "PAT-1024",
    reviewerImg:
      "https://media.istockphoto.com/id/1402125957/photo/portrait-of-handsome-smart-indian-professional-therapist-in-medical-uniform-and-stethoscope.jpg?s=612x612&w=0&k=20&c=7_Jk-OXSUvy0ki4W3QQJyS_AxTtAdNJlrDaueDXQu84=",
    target: "Dr. Anjali Sharma (DOC-784512)",
    date: "15 Dec 2025",
    type: "patient",
  },

  {
    id: 2,
    stars: 4,
    title: "Good Experience",
    text: "Quick response and helpful advice. Video quality was great.",
    reviewer: "Priya M.",
    reviewerId: "PAT-2048",
    reviewerImg:
      "https://media.istockphoto.com/id/1175131167/photo/portrait-of-an-indian-woman-with-cancer-and-her-doctor.jpg?s=612x612&w=0&k=20&c=15FJDj5X4hla5DjAuK3WWLFJ1FfTd0zn-OkaCG2e6Eg=",
    target: "Dr. Vikram Singh (DOC-563214)",
    date: "20 Dec 2025",
    type: "patient",
  },

  {
    id: 3,
    stars: 5,
    title: "Best Doctor",
    text: "Very professional and caring. Solved my issue immediately.",
    reviewer: "Amit K.",
    reviewerId: "PAT-3096",
    reviewerImg:
      "https://c8.alamy.com/comp/2HBAKGX/portrait-of-positive-young-indian-male-doctor-doing-thumbs-up-while-sitting-at-desk-outdoor-village-hospital-with-lots-of-medicine-around-looking-at-2HBAKGX.jpg",
    target: "Dr. Anjali Sharma (DOC-784512)",
    date: "25 Dec 2025",
    type: "patient",
  },

  {
    id: 4,
    stars: 3,
    title: "Average Service",
    text: "Doctor was okay, but wait time was long.",
    reviewer: "Neha R.",
    reviewerId: "PAT-4152",
    reviewerImg:
      "https://as2.ftcdn.net/jpg/03/66/06/71/1000_F_366067105_VQPjB0tBIU3pu7H2Cbt7HcPXX74Ve79z.jpg",
    target: "Dr. Vikram Singh (DOC-563214)",
    date: "10 Dec 2025",
    type: "patient",
  },

  {
    id: 5,
    stars: 1,
    title: "Not Satisfied",
    text: "Doctor seemed rushed and didn’t listen properly.",
    reviewer: "Rohan P.",
    reviewerId: "PAT-5201",
    reviewerImg:
      "https://www.shutterstock.com/image-photo/indian-asian-senior-male-patient-260nw-2596976387.jpg",
    target: "Dr. Anjali Sharma (DOC-784512)",
    date: "05 Dec 2025",
    type: "patient",
  },
];

function Reviews() {
  const [currentUserType, setCurrentUserType] =
    useState("patient");

  const [currentStarFilter, setCurrentStarFilter] =
    useState(0);

  const [searchName, setSearchName] = useState("");

  const [searchId, setSearchId] = useState("");

  const [selectedRating, setSelectedRating] =
    useState(0);

  const [targetInput, setTargetInput] =
    useState("");

  const [reviewTitle, setReviewTitle] =
    useState("");

  const [reviewText, setReviewText] =
    useState("");

  const location = useLocation();

  const typeReviews = useMemo(() => {
    return allReviews.filter(
      (review) => review.type === currentUserType
    );
  }, [currentUserType]);

  const analytics = useMemo(() => {
    const total = typeReviews.length;

    const sum = typeReviews.reduce(
      (acc, review) => acc + review.stars,
      0
    );

    const avg =
      total === 0
        ? 0
        : Number((sum / total).toFixed(1));

    const dist = [0, 0, 0, 0, 0];

    typeReviews.forEach((review) => {
      dist[review.stars - 1] += 1;
    });

    return { avg, total, dist };
  }, [typeReviews]);

  const filteredReviews = useMemo(() => {
    return allReviews.filter((review) => {
      const matchesType =
        review.type === currentUserType;

      const matchesStars =
        currentStarFilter === 0 ||
        review.stars === currentStarFilter;

      const normalizedSearchName =
        searchName.trim().toLowerCase();

      const normalizedSearchId =
        searchId.trim().toLowerCase();

      const matchesName =
        !normalizedSearchName ||
        review.reviewer
          .toLowerCase()
          .includes(normalizedSearchName) ||
        review.target
          .toLowerCase()
          .includes(normalizedSearchName);

      const matchesId =
        !normalizedSearchId ||
        review.reviewerId
          .toLowerCase()
          .includes(normalizedSearchId) ||
        review.target
          .toLowerCase()
          .includes(normalizedSearchId);

      return (
        matchesType &&
        matchesStars &&
        matchesName &&
        matchesId
      );
    });
  }, [
    currentUserType,
    currentStarFilter,
    searchName,
    searchId,
  ]);

  const starButtons = [0, 5, 4, 3, 2, 1];

  const onSubmit = (event) => {
    event.preventDefault();

    setSelectedRating(0);
    setTargetInput("");
    setReviewTitle("");
    setReviewText("");

    alert("Thank you for your review!");
  };

  const buildStars = (count) => {
    return Array.from({ length: 5 }, (_, index) => (
      <i
        key={index}
        className={
          index < count
            ? "fas fa-star"
            : "far fa-star"
        }
      />
    ));
  };

  return (
    <div className="container">
      <style>{`
        body {
          font-family: Arial, sans-serif;
          background: #f4f7fa;
          margin: 0;
          padding: 0;
        }

        .container {
          max-width: 1200px;
          margin: auto;
          padding: 20px;
        }

        .page-nav {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 20px 0;
        }

        .logo {
          font-size: 28px;
          font-weight: bold;
          color: #3498db;
        }

        .nav-links {
          display: flex;
          gap: 20px;
        }

        .nav-link {
          text-decoration: none;
          color: #333;
          font-weight: 600;
        }

        .nav-link.active {
          color: #3498db;
        }

        .page-header {
          text-align: center;
          margin: 40px 0;
        }

        .page-header h1 {
          font-size: 42px;
        }

        .user-toggle {
          text-align: center;
          margin-bottom: 30px;
        }

        .user-toggle button {
          padding: 12px 25px;
          margin: 0 10px;
          border: none;
          border-radius: 8px;
          cursor: pointer;
          font-size: 16px;
        }

        .user-toggle button.active {
          background: #3498db;
          color: white;
        }

        .analytics {
          background: white;
          padding: 25px;
          border-radius: 12px;
          margin-bottom: 30px;
          text-align: center;
        }

        .avg-rating {
          font-size: 50px;
          color: #f39c12;
        }

        .filters {
          display: flex;
          gap: 20px;
          margin-bottom: 30px;
        }

        .filter-group {
          flex: 1;
        }

        .filter-group input {
          width: 100%;
          padding: 10px;
          border-radius: 8px;
          border: 1px solid #ccc;
        }

        .star-filter {
          text-align: center;
          margin-bottom: 30px;
        }

        .star-filter button {
          margin: 5px;
          padding: 10px 20px;
          border: none;
          border-radius: 30px;
          cursor: pointer;
        }

        .star-filter .active {
          background: #f39c12;
          color: white;
        }

        .reviews-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(350px, 1fr));
          gap: 25px;
        }

        .review-card {
          background: white;
          padding: 25px;
          border-radius: 14px;
          box-shadow: 0 4px 15px rgba(0,0,0,0.1);
        }

        .review-header {
          display: flex;
          align-items: center;
          margin-bottom: 15px;
        }

        .review-header img {
          width: 70px;
          height: 70px;
          border-radius: 50%;
          object-fit: cover;
          margin-right: 15px;
        }

        .reviewer-name {
          font-size: 20px;
          font-weight: bold;
        }

        .stars {
          color: #f39c12;
          margin: 10px 0;
        }

        .review-title {
          font-size: 22px;
        }

        .review-text {
          color: #555;
          line-height: 1.6;
        }

        .write-review {
          margin-top: 50px;
          background: linear-gradient(
            135deg,
            #667eea,
            #764ba2
          );
          padding: 40px;
          border-radius: 14px;
          color: white;
        }

        .form-group {
          margin-bottom: 20px;
        }

        .form-group input,
        .form-group textarea {
          width: 100%;
          padding: 12px;
          border-radius: 8px;
          border: none;
          margin-top: 8px;
        }

        .star-rating i {
          font-size: 32px;
          margin-right: 10px;
          cursor: pointer;
          color: #ddd;
        }

        .star-rating i.active {
          color: #f39c12;
        }

        .submit-btn {
          padding: 14px 30px;
          border: none;
          border-radius: 30px;
          background: #f39c12;
          color: white;
          cursor: pointer;
          font-size: 18px;
        }
      `}</style>



      <header className="page-header">
        <h1>⭐ Reviews & Ratings</h1>

        <p>
          Transparent feedback from both
          patients and doctors
        </p>
      </header>

      <div className="user-toggle">
        <button
          className={
            currentUserType === "patient"
              ? "active"
              : ""
          }
          onClick={() =>
            setCurrentUserType("patient")
          }
        >
          I am a Patient
        </button>

        <button
          className={
            currentUserType === "doctor"
              ? "active"
              : ""
          }
          onClick={() =>
            setCurrentUserType("doctor")
          }
        >
          I am a Doctor
        </button>
      </div>

      <section className="analytics">
        <h3>Review Analytics</h3>

        <div className="avg-rating">
          {analytics.avg} / 5
        </div>

        <div>
          Based on {analytics.total} reviews
        </div>
      </section>

      <section className="filters">
        <div className="filter-group">
          <label>Search Name</label>

          <input
            type="text"
            placeholder="Enter name"
            value={searchName}
            onChange={(e) =>
              setSearchName(e.target.value)
            }
          />
        </div>

        <div className="filter-group">
          <label>Search ID</label>

          <input
            type="text"
            placeholder="Enter ID"
            value={searchId}
            onChange={(e) =>
              setSearchId(e.target.value)
            }
          />
        </div>
      </section>

      <div className="star-filter">
        {starButtons.map((star) => (
          <button
            key={star}
            className={
              currentStarFilter === star
                ? "active"
                : ""
            }
            onClick={() =>
              setCurrentStarFilter(star)
            }
          >
            {star === 0
              ? "All Reviews"
              : `${star} Stars`}
          </button>
        ))}
      </div>

      <section className="reviews-grid">
        {filteredReviews.map((review) => (
          <div
            key={review.id}
            className="review-card"
          >
            <div className="review-header">
              <img
                src={review.reviewerImg}
                alt={review.reviewer}
              />

              <div>
                <div className="reviewer-name">
                  {review.reviewer}
                </div>

                <div>
                  {review.reviewerId}
                </div>
              </div>
            </div>

            <div className="stars">
              {buildStars(review.stars)}
            </div>

            <h3 className="review-title">
              {review.title}
            </h3>

            <p className="review-text">
              {review.text}
            </p>

            <div>
              Reviewed{" "}
              <strong>{review.target}</strong>
              <br />
              {review.date}
            </div>
          </div>
        ))}
      </section>

      <section className="write-review">
        <h2>Leave a Review</h2>

        <form onSubmit={onSubmit}>
          <div className="form-group">
            <label>Doctor Name & ID</label>

            <input
              type="text"
              value={targetInput}
              onChange={(e) =>
                setTargetInput(e.target.value)
              }
              required
            />
          </div>

          <div className="form-group">
            <label>Rate Experience</label>

            <div className="star-rating">
              {[1, 2, 3, 4, 5].map((value) => (
                <i
                  key={value}
                  className={`fas fa-star ${
                    selectedRating >= value
                      ? "active"
                      : ""
                  }`}
                  onClick={() =>
                    setSelectedRating(value)
                  }
                />
              ))}
            </div>
          </div>

          <div className="form-group">
            <label>Review Title</label>

            <input
              type="text"
              value={reviewTitle}
              onChange={(e) =>
                setReviewTitle(e.target.value)
              }
              required
            />
          </div>

          <div className="form-group">
            <label>Your Feedback</label>

            <textarea
              rows="5"
              value={reviewText}
              onChange={(e) =>
                setReviewText(e.target.value)
              }
              required
            />
          </div>

          <button
            className="submit-btn"
            type="submit"
          >
            Submit Review
          </button>
        </form>
      </section>
    </div>
  );
}

export default Reviews;