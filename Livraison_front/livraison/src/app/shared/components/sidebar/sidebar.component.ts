import { animate, state, style, transition, trigger } from '@angular/animations';
import { Component, EventEmitter, HostListener, Input, OnInit, Output } from '@angular/core';
import { BreakpointObserver, Breakpoints } from '@angular/cdk/layout';
import { Router } from '@angular/router';
import { UserService } from 'src/app/features/user/services/user/user.service';

interface SidebarLink {
  label: string;
  icon: string;
  route: string;
  id: string;
  roles: string[]; // les rôles autorisés
}
@Component({
  selector: 'app-sidbar',
  templateUrl: './sidebar.component.html',
  styleUrls: ['./sidebar.component.css'],
  animations: [
    trigger('sidebarState', [
      // Desktop states
      state('desktop-expanded', style({
        width: '280px',
        transform: 'translateX(0)'
      })),
      state('desktop-collapsed', style({
        width: '60px',
        transform: 'translateX(0)'
      })),
      // Mobile states
      state('mobile-hidden', style({
        transform: 'translateX(-100%)',
        width: '280px'
      })),
      state('mobile-visible', style({
        transform: 'translateX(0)',
        width: '280px'
      })),
      // Transitions
      transition('* => *', animate('300ms ease-in-out'))
    ])
  ]
})


 
export class SidebarComponent implements OnInit {

  constructor(
      private userService: UserService,
      private router: Router
    ) {}

     @Output() toggleSidebar = new EventEmitter<void>();
     @Input() isCollapsed : boolean= false;
    userRole: string = '';

     
  
  isSidebarHidden = false;
  isMobileVisible = false;
  isMobile = false;
  isMobileScreen=false ;
  isSidebarClosed = false;

   activeLink : string = '';

 links: SidebarLink[] = [
    { id: 'dashboard', label: 'Dashboard', icon: 'bxs-dashboard', route: '/dashboard', roles: ['ROLE_ADMIN', 'ROLE_CLIENT', 'ROLE_AGENT','ROLE_LIVREUR'] },
    { id: 'store', label: 'My Store', icon: 'bxs-shopping-bag-alt', route: '/store', roles: ['ROLE_CLIENT'] },
    { id: 'analytics', label: 'Analytics', icon: 'bxs-doughnut-chart', route: '/analytics', roles: ['ROLE_ADMIN'] },
    { id: 'messages', label: 'Messages', icon: 'bxs-message-dots', route: '/messages', roles: ['ROLE_ADMIN', 'ROLE_AGENT'] },
    { id: 'team', label: 'Team', icon: 'bxs-group', route: '/team', roles: ['ROLE_ADMIN'] }
  ];




ngOnChanges() {
  //console.log('Sidebar collapsed state changed:', this.isCollapsed);
}

   // Should be replaced with:
get currentState() {
  if (this.isMobile) {
    return this.isCollapsed ? 'mobile-hidden' : 'mobile-visible';
  } else {
    return this.isCollapsed ? 'desktop-collapsed' : 'desktop-expanded';
  }
}

     setActive(link: string) {
    this.activeLink = link;
  }


   onLogout() {
    this.userService.logout();
    this.router.navigate(['user/login']);
    
  }

  @HostListener('window:resize', ['$event'])
  onResize(event: Event) {
    this.checkScreenSize();
  }

  ngOnInit() {
    this.checkScreenSize();
     this.userRole = this.userService.getUserRole() ?? '';

  }

  checkScreenSize() {
const width = window.innerWidth;
  this.isMobile = width <= 768;
  this.isCollapsed = this.isMobile; // collapse by default on mobile
}

  sidebarToggle() : void {

    this.toggleSidebar.emit();
    if (this.isMobile) {
    this.isSidebarClosed = !this.isSidebarClosed;
  } else {
    this.isCollapsed = !this.isCollapsed;
  }
    console.log('Navbar: Event emitted',this.toggleSidebar.emit() ); // Debug log 2
  }

  toggleSidebarState() {
    console.log('Toggling sidebar');
  this.isCollapsed = !this.isCollapsed;
}


}