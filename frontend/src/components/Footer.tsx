import { FaEnvelope, FaGithub } from "react-icons/fa";

const Footer = () => {
  return (
    <footer className="bg-background border-t py-6 mt-auto">
      <div className="container mx-auto px-4">
        <div className="flex flex-col md:flex-row justify-between items-center">
          <div className="mb-4 md:mb-0">
            <h2 className="text-xl font-bold">Sportboxd</h2>
            <p className="text-sm text-muted-foreground">
              &copy; {new Date().getFullYear()} Sportboxd. All rights reserved.
            </p>
          </div>

          <div className="flex flex-col items-center md:items-end">
            <h3 className="font-semibold mb-2">Connect</h3>
            <div className="flex gap-4">
              <a
                href="mailto:akotov9962@gmail.com"
                className="text-muted-foreground hover:text-primary flex items-center gap-2"
              >
                <FaEnvelope /> <span>Email</span>
              </a>
              <a
                href="https://github.com/alexkotov10/sportboxd"
                target="_blank"
                rel="noopener noreferrer"
                className="text-muted-foreground hover:text-primary flex items-center gap-2"
              >
                <FaGithub /> <span>GitHub</span>
              </a>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
