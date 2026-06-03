import Header from './components/Header';
import FileUploadForm from './components/FileUploadForm';
import './App.css';

function App() {
  return (
    <div className="app">
      <Header />
      <main className="main-content">
        <FileUploadForm />
      </main>
    </div>
  );
}

export default App;
