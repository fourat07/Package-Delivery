import { Component, HostListener, OnDestroy, OnInit } from '@angular/core';
import { ActivatedRoute, NavigationEnd, Router } from '@angular/router';
import { filter, map, mergeMap, Observable, Subject, takeUntil } from 'rxjs';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})

export class AppComponent implements OnInit, OnDestroy {
  private destroy$ = new Subject<void>();
  showNavbar$: Observable<boolean> | undefined;

  constructor(private router: Router, private activatedRoute: ActivatedRoute) {}

  isCollapsed = false;

   isSidebarOpen = false; 

  toggleSidebar() {
   console.log('📦 AppComponent toggled sidebar:', this.isCollapsed); 
    this.isSidebarOpen = !this.isSidebarOpen;
   this.isCollapsed = !this.isCollapsed;
  
  }

  ngOnInit() {
    this.showNavbar$ = this.router.events.pipe(
      filter(event => event instanceof NavigationEnd),
      map(() => this.activatedRoute),
      map(route => {
        while (route.firstChild) route = route.firstChild;
        return route;
      }),
      filter(route => route.outlet === 'primary'),
      mergeMap(route => route.data),
      map(data => !data['hideNavbar']),
      takeUntil(this.destroy$)
    );

    this.onResize(new Event('resize'));
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }
  get isMobileScreen() {
  return window.innerWidth <= 992;
}

@HostListener('window:resize', ['$event'])
onResize(event: Event) {
  const width = window.innerWidth;

  // Collapse sidebar automatically in this width range
  if (width >= 769 && width <= 1252) {
    this.isCollapsed = true;
  } else {
    this.isCollapsed = false;
  }
}

get isScreenBetween(): boolean {
  const width = window.innerWidth;
  return width >= 769 && width <= 1252;
}
}
