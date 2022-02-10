import { FunctionalComponent, h } from 'preact';
import style from './style.css';

const Home: FunctionalComponent = () => {
    return (
        <div class={style.home}>
            <h1>Welcome</h1>
            <p>We Got You Covered insurance. Get your personalized offer today.</p>
            <p>Click the "Get an offer" menu top right.</p>
        </div>
    );
};

export default Home;
