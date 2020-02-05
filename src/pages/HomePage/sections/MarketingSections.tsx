import style from '../HomePage.module.scss'
import React from 'react'

function MarketingSections() {
  return (
    <>
      <section id='features' className={style['marketing-1']}>
        <div className={style['group']}>
          <h2>
            Digital advertisement
            <small>
            of products has never been so easy
            </small>
          </h2>
          <p>Buildboard.tv is an end-to-end Indoor digital signage solution for product advertisement that enables you to easily create and publish advertisements to digital screens.</p>
          <p>With Buildboard platform you can change the signage content in your business constantly and dynamically raising the customers awareness of your products and services.</p>
          <span>Regain control of your billboard now !</span>
        </div>
      </section>

      <section className={style['marketing-2']}>
        <div className={style['group']}>
          <h2>
            <small>Fast</small>
            Time to Market
            <label>SaaS</label>
          </h2>
          <p>A two tier SaaS solution, allowing you to access and manipulate your advertising campaigns from any browser and stream the content instantly into any digital screen over the web using common streaming devices.</p>
          <p>Everything is dynamic, adding new ads or even a change in a product price reflects within a seconds on your digital signage, keeping your signage updated and valid all the time.</p>
          <span>A new <b>digital age</b> has come</span>
        </div>
      </section>

      <section className={style['marketing-3']}>
        <div className={style['group']}>
          <h2>Categories & Templates<br/>Understanding <b>your market</b></h2>
          <p>Advertisement appearance and style is subjected to the market segmentation of your business. Buildboard offers a large variety of templated advertisements focused on your merchandise marketing style making your content looks appealing and professional.</p>
          <span>leave the <b>creativity</b> for us<br/>focus on the <b>content</b></span>
        </div>
      </section>

      <section className={style['marketing-4']}>
        <div className={style['group']}>
          <h2>Manage your <b>products</b><br/>it's simple then ever<label>Catalog & Branding</label></h2>
          <p>Buildboard embraces a product first approach, allowing you to create your own informative product catalog with a set of integrated tools making the process a breeze.</p>
          <p>Products are not only images, our templates makes a smart use of your products information  to infer textual labels such as price, brand, model, type and more.</p>
          <span>Get <b>focused on products and marketing !</b></span>
        </div>
      </section>

      <section className={style['marketing-5']}>
        <div className={style['group']}>
          <h2>Be Exclusive !</h2>
          <p>Branding is a key feature in advertisement. By defining few styling characteristics such as colors and fonts along with your logo you can have your own personal branding.</p>
          <p>The platform easily accommodate to your business style and theme by applying your branding into any template with a click of a button.</p>
          <span>Your content will look exclusive and highly appealing</span>
        </div>
      </section>
    </>
  )
}

export default MarketingSections
