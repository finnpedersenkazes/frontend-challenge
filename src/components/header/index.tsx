import { FunctionalComponent, h } from 'preact';
import { Link } from 'preact-router/match';
import style from './style.css';

const Header: FunctionalComponent = () => {
    return (
        <header class={style.header}>
            <h1>We Got You Covered</h1>
            <nav>
                <Link activeClassName={style.active} href="/">
                    Home
                </Link>
                <Link activeClassName={style.active} href="/profile">
                    Get an offer
                </Link>
                <Link activeClassName={style.active} href="/profile/Christian">
                    Login
                </Link>
            </nav>
        </header>
    );
};

export default Header;
