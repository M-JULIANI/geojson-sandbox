export default function NavBar() {
  return (
    <nav className="fixed top-0 left-0 right-0 bg-gray-800 border-b border-gray-700 z-50 h-24">
      <div className="mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-24">
          <div className="flex items-center">
            <div className="text-white font-semibold text-lg">Forma Takehome</div>
          </div>
        </div>
      </div>
    </nav>
  );
}
