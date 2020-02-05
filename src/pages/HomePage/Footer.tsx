import style from './Footer.module.scss'
import React from 'react';

function Footer() {
  return (
    <footer id='contact-us' className={style['footer']}>
      <div className={style['footer-group']}>
        <div className={style['footer-about']}>
          <h4>About us</h4>
          <p>We are a team that combines proven experience from the design, technology and business realms. We are focused on creating a simple, intuitive and low cost advertisement platform that facilitate the process of  content creation and streaming it to digital screens, providing the perfect signage solution for your business.</p>
        </div>
        <div className={style['footer-contact']}>
          <h4>Contact us</h4>
          <p>We are eager to hear from you at any time.<br/>To request a demo, or schedule a meeting<br/>with us please leave your details below.</p>
        </div>
        <div className={style['footer-links']}>
          <a href='/' className={style['footer-logo']}>
            <img src='/Logo-WT.png' alt='logo' />
          </a>
          <a href='mailto:support@buildboard.tv' className={style['footer-support']}>
            support@buildboard.tv
          </a>
          <a href='tel:+972507123403' className={style['footer-tel']}>
            +972 507 123 403
          </a>
          <span className={style['footer-signup']}>
            <a href='/user/signup'>Signup</a>
            &nbsp;or&nbsp;
            <a href='/user/login'>Login</a>
          </span>
        </div>
      </div>
      <div className={style['footer-social']}>
        <a href='https://www.facebook.com' target='_blank' rel='noopener noreferrer'>
          <img src='/facebook.png' alt='facebook' />
        </a>
        <a href='https://www.instegram.com' target='_blank' rel='noopener noreferrer'>
          <img src='/instegram.png' alt='instegram' />
        </a>
        <a href='https://www.youtube.com' target='_blank' rel='noopener noreferrer'>
          <img src='/youtube.png' alt='youtube' />
        </a>
      </div>
      <div className={style['footer-rights']}>
        All rights reserved to buildboard.tv
      </div>
    </footer>
  )
}

export default Footer
