import { Injectable, Renderer2, RendererFactory2 } from '@angular/core';

type Subject = 'Error' | 'Warning' | "Info" | 'Success';

@Injectable({
  providedIn: 'root'
})
export class AlertService {
  private renderer: Renderer2;

  constructor(rendererFactory: RendererFactory2) {
    this.renderer = rendererFactory.createRenderer(null, null);
  }

  showToast(subject: Subject, message: string) {
    const toastContainer = document.querySelector('.toast-container');
    if (!toastContainer) return;
    const classColor = this.getClass(subject);

    const toast = this.renderer.createElement('div');
    this.renderer.addClass(toast, 'toast');
    this.renderer.addClass(toast, 'fade');
    this.renderer.addClass(toast, 'show');
    this.renderer.setAttribute(toast, 'role', 'alert');
    this.renderer.setAttribute(toast, 'aria-live', 'assertive');
    this.renderer.setAttribute(toast, 'aria-atomic', 'true');

    const toastHeader = this.renderer.createElement('div');
    this.renderer.addClass(toastHeader, 'toast-header');
    this.renderer.addClass(toastHeader, `border-${classColor}`);
    this.renderer.addClass(toastHeader, 'border-bottom');

    const icon = this.renderer.createElement('i');
    this.renderer.addClass(icon, 'bi');
    this.renderer.addClass(icon, 'bi-exclamation-octagon');
    this.renderer.addClass(icon, 'me-1');
    this.renderer.addClass(icon, `text-${classColor}`);

    const strong = this.renderer.createElement('strong');
    this.renderer.addClass(strong, 'me-auto');
    this.renderer.addClass(strong, `text-${classColor}`);
    const strongText = this.renderer.createText(subject);
    this.renderer.appendChild(strong, strongText);

    const button = this.renderer.createElement('button');
    this.renderer.addClass(button, 'btn-close');
    this.renderer.setAttribute(button, 'type', 'button');
    this.renderer.setAttribute(button, 'data-bs-dismiss', 'toast');
    this.renderer.setAttribute(button, 'aria-label', 'Close');

    this.renderer.appendChild(toastHeader, icon);
    this.renderer.appendChild(toastHeader, strong);
    this.renderer.appendChild(toastHeader, button);

    const toastBody = this.renderer.createElement('div');
    this.renderer.addClass(toastBody, 'toast-body');
    const bodyText = this.renderer.createText(message);
    this.renderer.appendChild(toastBody, bodyText);

    this.renderer.appendChild(toast, toastHeader);
    this.renderer.appendChild(toast, toastBody);

    this.renderer.appendChild(toastContainer, toast);

    setTimeout(() => {
      this.renderer.removeChild(toastContainer, toast);
    }, 3000); // Automatically remove the toast after 3 seconds
  }

  private getClass(subject: Subject) {
    switch (subject) {
      case "Error":
        return 'danger'
      case "Warning":
        return 'warning'
      case "Success":
        return 'success'
      case "Info":
        return 'info'
    }
  }
}
