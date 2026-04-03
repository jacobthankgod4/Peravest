import React from 'react';
import '../styles/team.css';

interface TeamMember {
  id: number;
  name: string;
  role: string;
  image: string;
}

const teamMembers: TeamMember[] = [
  {
    id: 1,
    name: 'OWOLABI ENOCH OLAWALE',
    role: 'CEO/DIRECTOR',
    image: '/i/1.jpg'
  },
  {
    id: 2,
    name: 'Adisa Fatai Oluwasegun',
    role: 'Operation Manager at Perazim Proptee Ltd | Realtor | Lifelong Learner | Family-Oriented',
    image: '/i/7.jpg'
  },
  {
    id: 3,
    name: 'SOLICITOR OLUWASEUN TEMITOPE ADENUGA (LL.B)',
    role: 'Solicitor',
    image: '/i/aaa.jpg'
  }
];

const Team: React.FC = () => {
  return (
    <div className="team-area py-120">
      <div className="container">
        <div className="row">
          <div className="col-lg-6 mx-auto wow fadeInDown" data-wow-duration="1s" data-wow-delay=".25s">
            <div className="site-heading text-center">
              <span className="site-title-tagline">Our Team</span>
              <h2 className="site-title">Meet With Our Team</h2>
            </div>
          </div>
        </div>
        <div className="row">
          {teamMembers.map((member, index) => (
            <div key={member.id} className="col-md-6 col-lg-4">
              <div 
                className="team-item wow fadeInUp" 
                data-wow-duration="1s" 
                data-wow-delay={`.${50 + index * 25}s`}
              >
                <div className="team-img">
                  <img src={member.image} alt={member.name} />
                </div>
                <div className="team-content">
                  <div className="team-bio">
                    <h5>
                      <a href="#">{member.name}</a>
                    </h5>
                    <span>{member.role}</span>
                  </div>
                  <div className="team-social">
                    <ul className="team-social-btn">
                      <li>
                        <span>
                          <i className="far fa-share-alt"></i>
                        </span>
                      </li>
                      <li>
                        <a href="#">
                          <i className="fab fa-facebook-f"></i>
                        </a>
                      </li>
                      <li>
                        <a href="#">
                          <i className="fab fa-twitter"></i>
                        </a>
                      </li>
                      <li>
                        <a href="#">
                          <i className="fab fa-instagram"></i>
                        </a>
                      </li>
                      <li>
                        <a href="#">
                          <i className="fab fa-linkedin-in"></i>
                        </a>
                      </li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Team;
