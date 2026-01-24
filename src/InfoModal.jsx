import React, { useEffect } from "react";
import PropTypes from "prop-types";
import { RISK_TYPES } from "./constants";

const InfoModal = ({ isOpen, onClose }) => {
  // Close on Escape key
  useEffect(() => {
    const handleEscape = (e) => {
      if (e.key === "Escape") {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener("keydown", handleEscape);
      return () => document.removeEventListener("keydown", handleEscape);
    }
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div className="info-modal-overlay" onClick={onClose}>
      <div className="info-modal" onClick={(e) => e.stopPropagation()}>
        <div className="info-modal-header">
          <h3>Climate Risk Factors</h3>
          <button className="info-modal-close" onClick={onClose}>
            &times;
          </button>
        </div>
        <div className="info-modal-content">
          {RISK_TYPES.map((type) => (
            <div key={type.key} className="info-modal-factor">
              <h4>{type.label}</h4>
              <p>{type.description}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

InfoModal.propTypes = {
  isOpen: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
};

export default InfoModal;
