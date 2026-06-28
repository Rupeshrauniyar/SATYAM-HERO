import React from "react";
import { Link } from "react-router-dom";
import Search from "../pages/Search";

const GovSearch = () => {
  return (
    <Search
      basePath="/gov/search"
      heading="Search Reports"
      intro="Search citizen reports and review issues raised in your area."
      action={
        <Link to="/gov/users" className="x-btn x-btn-secondary x-btn-sm">
          Manage Users
        </Link>
      }
    />
  );
};

export default GovSearch;
