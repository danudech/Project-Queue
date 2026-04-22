'use client'; 
import React from 'react'
import HorizontalMenu from './horizontal-menu';
import HeaderContent from './header-content';
import HeaderLogo from './header-logo';
import { SidebarToggle } from '../sidebar/sidebar-toggle';
import HeaderSearch from './header-search';
import LocalSwitcher from './locale-switcher';
import ThemeSwitcher from './theme-switcher';
import Messages from './messages';
import { Cart } from './cart';
import Notifications from './notifications';
import ProfileInfo from './profile-info';
import { SheetMenu } from '../sidebar/menu/sheet-menu';

const DashCodeHeader = () => {
    return (
        <>
        <HeaderContent>
                <div className=' flex gap-3 items-center'>
                    <HeaderLogo />
                    <SidebarToggle />
                    <HeaderSearch />
                </div>
                <div className="nav-tools flex items-center  md:gap-4 gap-3">
                    <LocalSwitcher />
                    <ThemeSwitcher />
                    <Cart />
                    <Messages />
                    <Notifications />
                    <ProfileInfo />
                    <SheetMenu />
                </div>
            </HeaderContent>
            <HorizontalMenu />
        </>
    )
}

export default DashCodeHeader