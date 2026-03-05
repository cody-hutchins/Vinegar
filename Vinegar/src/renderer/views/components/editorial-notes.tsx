const EditorialNotes = () => (
  <div className="modal-backdrop">
    <div className="modal-dialog">
      <div className="modal-header">
        <button
          type="button"
          className="close">
          &times;
        </button>
        <h4
          className="modal-title"
          v-html={title}
        />
      </div>
      <div
        className="modal-content"
        v-html={content}
      />
      <div className="modal-footer" />
    </div>
  </div>
);

export default EditorialNotes;
