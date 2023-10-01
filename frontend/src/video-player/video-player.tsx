import './ResponsiveVideo.css';
import { useAppSelector } from '../redux/hooks';


export function VideoPlayer() {
  const videoState = useAppSelector((state) => state.video)
    return (
      <div>
      <nav className="navbar">
          <ul className="nav-list">
            <li>My Video Player</li>
          </ul>
        </nav>
      <div className="video-container">
        <video controls>
          {videoState.currentVideo ? <source src={`http://localhost:3001/videos/${videoState.currentVideo.id}/`} type="video/mp4" /> : ''}
        </video>
      </div>
      </div>
    );
}
