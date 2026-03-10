const EditorialNotes = ({ title, content }: { title: any; content: any }) => (
  <div className={"modal-backdrop"}>
    <div className={"modal-dialog"}>
      <div className={"modal-header"}>
        <button
          type={"button"}
          className={"close"}>
          &times;
        </button>
        <h4 className={"modal-title"}>
          <div dangerouslySetInnerHTML={{ __html: title }} />
        </h4>
      </div>
      <div
        className={"modal-content"}
        dangerouslySetInnerHTML={{ __html: content }}
      />
      <div className={"modal-footer"} />
    </div>
  </div>
);

export default EditorialNotes;
