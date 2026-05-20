import UploadForm from "../../components/form/UploadForm";

const CreateNoteBook = () => {
  const handleCreate = async (text: string, file?: File) => {
    const formData = new FormData();
    formData.append("text", text);
    if (file) {
      formData.append("file", file);
    }

    const res = await fetch(`${import.meta.env.VITE_API_URL}/api/ingest`, { credentials: 'include', body: formData });
    const resBody = await res.json();
    console.log(resBody);
  };

  return <UploadForm onSubmit={handleCreate} open={ false} handleClose={() => {}}/>;
};

export default CreateNoteBook;
