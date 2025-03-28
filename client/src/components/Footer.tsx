const Footer = () => {
  return (
    <footer className="bg-neutral-700 text-white py-4 mt-8">
      <div className="container mx-auto px-4 text-center text-sm">
        <p>CamX &copy; {new Date().getFullYear()}</p>
        <div className="mt-2 flex justify-center space-x-4">
          <a href="#" className="text-neutral-300 hover:text-white">Privacy Policy</a>
          <a href="#" className="text-neutral-300 hover:text-white">Terms of Service</a>
          <a href="#" className="text-neutral-300 hover:text-white">Help & Support</a>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
