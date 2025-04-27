import './App.css';
import CSVUploadHome from './ui/csvUploadHome';

function App() {
  const userInfo = window.location.search.split('?')[1].split('&');
  const userId = userInfo[0].split('=')[1];
  const authToken = userInfo[1].split('=')[1];
  const instanceUrl = userInfo[2].split('=')[1];
  localStorage.setItem('UserId', userId);
  localStorage.setItem('AuthToken', authToken);
  localStorage.setItem('instanceUrl', instanceUrl);
  return (
    <div className="App">
      <CSVUploadHome/>
    </div>
  );
}

export default App;
