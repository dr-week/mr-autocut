import './styles.scss';
import { initStudio } from './state';
import { createShell } from './shell';

document.querySelector<HTMLDivElement>('#app')!.append(createShell());
initStudio();
