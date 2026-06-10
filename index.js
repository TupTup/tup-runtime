import './components/components.css';
import './css/app.css';

import './js/place-mode.js';

import './components/tup-place-header.js';
import './components/tup-place-photo.js';
import './components/tup-place-summary.js';
import './components/tup-route-steps.js';
import './components/tup-navigation-button.js';
import './components/tup-footer.js';

import { initPlaceEditor, initPlaceView } from './js/place-mode.js';

initPlaceEditor();
initPlaceView();
