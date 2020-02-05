import style from '../HomePage.module.scss';
import React from 'react';

const team = [
  {
    image: '/avi.jpg',
    title: 'Co Founder & CEO, CTO',
    name: 'Avi Mistriel',
    rule: 'Backend & Devops Developer',
    about:
      "I'm an enthusiastic software developer, eager to excel in my work and expertise. I consider my work as an art - it must be elegant, precise, and lovely so i can show to others :-)"
  },
  {
    image: '/matan.png',
    title: 'Co Founder & CMO, CFO',
    name: 'Matan Ben David',
    rule: 'Executive M.b.A Business & Finance',
    about:
      "I'm an enthusiastic software developer, eager to excel in my work and expertise . I consider my work as an art - it must be elegant, precise, and lovely so i can show to others :-)"
  },
  {
    image: '/elishay.png',
    title: 'Co Founder & VP Product',
    name: 'Elishay Touitou',
    rule: 'UI / UX Designer',
    about:
      "I'm an enthusiastic software developer, eager to excel in my work and expertise . I consider my work as an art - it must be elegant, precise, and lovely so i can show to others :-)"
  },
  {
    image: '/daniel.jpg',
    name: 'Daniel Yogel',
    rule: 'Frontend Development Leader',
    about:
      "I'm an enthusiastic software developer, eager to excel in my work and expertise . I consider my work as an art - it must be elegant, precise, and lovely so i can show to others :-)"
  }
];

function TeamSection() {
  return (
    <section id="team" className={style['team']}>
      <div className={style['wrapper']}>
        <h2>Meet the team</h2>
        <p>
          Buildboard.tv end-to-end indoor digital signage solution for product advertisement that enables you to easily create and publish advertisements to
          digital screens
        </p>
        <section>
          {team.map(member => (
            <div key={member.name} className={style['team-member']}>
              <div
                className={style['image']}
                style={{
                  backgroundImage: `url(${member.image})`
                }}>
                {member.title && <label>{member.title}</label>}
              </div>
              <div className={style['image-border']} />
              <div className={style['name']}>{member.name}</div>
              <div className={style['rule']}>{member.rule}</div>
              <p>{member.about}</p>
            </div>
          ))}
        </section>
      </div>
    </section>
  );
}

export default TeamSection;
