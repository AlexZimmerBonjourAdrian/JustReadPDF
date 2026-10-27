import React from 'react';

const Footer = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-[#F4F3EF] border-t border-[#E6E2DB]">
      <div className="max-w-7xl mx-auto px-6 lg:px-8 py-14">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-10">
          {/* Brand Section */}
          <div className="md:col-span-5">
            <div className="mb-5">
              <div className="flex items-center gap-3">
                <div className="bg-[#C0392B] p-2 rounded-[10px]">
                  <svg className="w-[18px] h-[18px] text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.75}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M7 7h7l3 3v8a2 2 0 01-2 2H7a2 2 0 01-2-2V9a2 2 0 012-2z" />
                  </svg>
                </div>
                <span className="text-[18px] font-bold tracking-[-0.02em] text-[#111214] font-serif">JustReadPDF</span>
              </div>
            </div>
            <p className="text-[#6B6560] text-[13px] leading-[1.7] max-w-[32ch] mb-6">
              Lectura y traducción de documentos largos — PDF, DOCX, EPUB — 100% en tu navegador. Sin subidas, con formato preservado.
            </p>
            <div className="flex gap-2">
              <a href="#" className="w-8 h-8 rounded-full border border-[#E6E2DB] bg-white flex items-center justify-center text-[#9A9590] hover:text-[#111214] hover:border-[#111214] transition-colors">
                <svg className="h-[14px] w-[14px]" fill="currentColor" viewBox="0 0 24 24"><path d="M8.29 20.251c7.547 0 11.675-6.253 11.675-11.675 0-.178 0-.355-.012-.53A8.348 8.348 0 0022 5.92a8.19 8.19 0 01-2.357.646 4.118 4.118 0 001.804-2.27 8.224 8.224 0 01-2.605.996 4.107 4.107 0 00-6.993 3.743 11.65 11.65 0 01-8.457-4.287 4.106 4.106 0 001.27 5.477A4.072 4.072 0 012.8 9.713v.052a4.105 4.105 0 003.292 4.022 4.095 4.095 0 01-1.853.07 4.108 4.108 0 003.834 2.85A8.233 8.233 0 012 18.407a11.616 11.616 0 006.29 1.84" /></svg>
              </a>
              <a href="#" className="w-8 h-8 rounded-full border border-[#E6E2DB] bg-white flex items-center justify-center text-[#9A9590] hover:text-[#111214] hover:border-[#111214] transition-colors">
                <svg className="h-[14px] w-[14px]" fill="currentColor" viewBox="0 0 24 24"><path fillRule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" clipRule="evenodd" /></svg>
              </a>
            </div>
          </div>

          {/* Product Links */}
          <div className="md:col-span-3">
            <h3 className="text-[#111214] font-semibold mb-5 text-[11px] tracking-[0.12em] uppercase">Producto</h3>
            <ul className="space-y-3">
              <li><a href="#" className="text-[#6B6560] hover:text-[#111214] transition-colors text-[13px] leading-relaxed">→ Lector PDF</a></li>
              <li><a href="#" className="text-[#6B6560] hover:text-[#111214] transition-colors text-[13px] leading-relaxed">→ Traductor</a></li>
              <li><a href="#" className="text-[#6B6560] hover:text-[#111214] transition-colors text-[13px] leading-relaxed">→ Todas las herramientas</a></li>
            </ul>
          </div>

          {/* Legal Links */}
          <div className="md:col-span-4">
            <h3 className="text-[#111214] font-semibold mb-5 text-[11px] tracking-[0.12em] uppercase">Legal</h3>
            <ul className="space-y-3">
              <li><a href="#" className="text-[#6B6560] hover:text-[#111214] transition-colors text-[13px] leading-relaxed">Privacidad</a></li>
              <li><a href="#" className="text-[#6B6560] hover:text-[#111214] transition-colors text-[13px] leading-relaxed">Términos</a></li>
              <li><a href="#" className="text-[#6B6560] hover:text-[#111214] transition-colors text-[13px] leading-relaxed">Contacto</a></li>
            </ul>
          </div>
        </div>

        {/* Bottom Section */}
        <div className="border-t border-[#E6E2DB] mt-10 pt-6 flex flex-col md:flex-row justify-between items-center gap-3">
          <p className="text-[#9A9590] text-[11px] tracking-[0.06em] uppercase">
            © {currentYear} JustReadPDF — Todos los derechos reservados
          </p>
          <p className="text-[#9A9590] text-[11px] tracking-wide">
            Hecho con tinta y papel — 100% local
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
