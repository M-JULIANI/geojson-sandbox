import React from 'react';
import NavBar from './components/NavBar';

const Layout = () => {
    return (
        <div className="min-h-screen">
            {/* Fixed Navigation */}
            <NavBar />

            {/* Main content with grid */}
            <div className="pt-24">
                {' '}
                {/* Add padding-top to account for fixed nav */}
                <div className="grid grid-cols-4 min-h-[calc(100vh-4rem)]">
                    {/* Left column - 1/4 width */}
                    <div className="border-r">
                        <h2 className="text-2xl p-4">List of proposed solutions</h2>
                    </div>

                    {/* Middle column - 2/4 width */}
                    <div className="col-span-2 border-r">
                        <h2 className="text-2xl p-4">Work surface for a selected solution</h2>
                    </div>

                    {/* Right column - 1/4 width */}
                    <div>
                        <h2 className="text-2xl p-4">Statistics</h2>
                        <p className="text-gray-400 p-4">Tools available for selected solution</p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Layout;
