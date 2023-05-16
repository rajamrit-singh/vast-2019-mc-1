import React from "react";
import Spinner from "react-bootstrap/Spinner";
import "./LoadingPage.css"; // You can create your own CSS file for styling

const LoadingPage = () => {
  return (
    <div className="loading-page">
      <Spinner animation="border" variant="primary" size="lg" />
      <h3>Loading...</h3>
    </div>
  );
};

export default LoadingPage;
