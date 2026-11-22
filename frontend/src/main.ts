import './styles.css';
import { initStudio } from './state';
import { createShell } from './shell';

document.getElementById('app')!.appendChild(createShell());
initStudio();
