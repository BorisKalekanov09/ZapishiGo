import React from "react";
import Modal from "react-bootstrap/Modal";
import Button from "react-bootstrap/Button";

export default function PlansModal({ show, onHide, plans, onLoad, onDelete }) {
  return (
    <Modal show={show} onHide={onHide} centered>
      <Modal.Header closeButton>
        <Modal.Title>Saved Plans</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        {plans.length === 0 && <div>No saved plans.</div>}
        <ul className="list-group">
          {plans.map((plan, idx) => (
            <li
              className="list-group-item d-flex justify-content-between align-items-center"
              key={idx}
            >
              <span>
                <strong>{plan.title}</strong>
              </span>
              <div>
                <Button
                  size="sm"
                  variant="outline-danger"
                  className="me-2"
                  onClick={() => onDelete(idx)}
                  title="Delete plan"
                >
                  &#10006;
                </Button>
                <Button size="sm" onClick={() => onLoad(plan)}>
                  Load
                </Button>
              </div>
            </li>
          ))}
        </ul>
      </Modal.Body>
    </Modal>
  );
}
