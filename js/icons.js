import FontAwesome from 'https://cdn.skypack.dev/@fortawesome/fontawesome-svg-core@6.4.0';
import icons from 'https://cdn.skypack.dev/@fortawesome/free-solid-svg-icons@6.4.0';

const { library, dom } = FontAwesome;
const {
    faStar, faStarHalfStroke, faArrowUp, faInfoCircle,
    faExclamationCircle, faExternalLinkAlt, faArrowLeft
} = icons;

library.add(faStar, faStarHalfStroke, faArrowUp, faInfoCircle,
    faExclamationCircle, faExternalLinkAlt, faArrowLeft);
dom.watch();