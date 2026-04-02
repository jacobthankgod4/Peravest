import React from 'react';
import Layout from '../components_main/Layout';
import ContactUs from './ContactUs';

const Contact: React.FC = () => {
  return (
    <Layout title="Contact Us - Peravest">
      <main className="main">
        <ContactUs />
      </main>
    </Layout>
  );
};

export default Contact;
