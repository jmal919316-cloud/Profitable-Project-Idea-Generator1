
import React from 'react';

const Header: React.FC = () => {
  return (
    <header className="w-full text-center py-8">
      <h1 className="text-4xl sm:text-5xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-600 mb-2">
        مولّد الأفكار الربحية
      </h1>
      <p className="text-slate-400 text-lg">
        حوّل شغفك إلى مشروع ناجح مع قوة الذكاء الاصطناعي
      </p>
    </header>
  );
};

export default Header;
