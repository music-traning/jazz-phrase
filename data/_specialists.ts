// data/specialists/_index.ts
import { ALLAN_HOLDSWORTH_DB } from './specialists/licks_allan_holdsworth';
import { BARNEY_KESSEL_DB } from './specialists/licks_barney_kessel';
import { BILL_FRISELL_DB } from './specialists/licks_bill_frisell';
import { CHARLIE_CHRISTIAN_DB } from './specialists/licks_charlie_christian';
import { DJANGO_REINHARDT_DB } from './specialists/licks_django_reinhardt';
import { ED_BICKERT_DB } from './specialists/licks_ed_bickert';
import { GEORGE_BENSON_DB } from './specialists/licks_george_benson';
import { GILAD_HEKSELMAN_DB } from './specialists/licks_gilad_hekselman';
import { GRANT_GREEN_DB } from './specialists/licks_grant_green';
import { HERB_ELLIS_DB } from './specialists/licks_herb_ellis';
import { JIM_HALL_DB } from './specialists/licks_jim_hall';
import { JOE_PASS_DB } from './specialists/licks_joe_pass';
import { JOHN_MCLAUGHLIN_DB } from './specialists/licks_john_mclaughlin';
import { JOHN_SCOFIELD_DB } from './specialists/licks_john_scofield';
import { JULIAN_LAGE_DB } from './specialists/licks_julian_lage';
import { KENNY_BURRELL_DB } from './specialists/licks_kenny_burrell';
import { KURT_ROSENWINKEL_DB } from './specialists/licks_kurt_rosenwinkel';
import { LENNY_BREAU_DB } from './specialists/licks_lenny_breau';
import { MIKE_STERN_DB } from './specialists/licks_mike_stern';
import { PASQUALE_GRASSO_DB } from './specialists/licks_pasquale_grasso';
import { PAT_METHENY_DB } from './specialists/licks_pat_metheny';
import { PETER_BERNSTEIN_DB } from './specialists/licks_peter_bernstein';
import { TAL_FARLOW_DB } from './specialists/licks_tal_farlow';
import { TOSHIKI_NUNOKAWA_DB } from './specialists/licks_toshiki_nunokawa';
import { WES_MONTGOMERY_DB } from './specialists/licks_wes_montgomery';
import { Lick } from './licks';

export const SPECIALIST_DB: Record<string, Record<string, Lick[]>> = {
  "Allan Holdsworth": ALLAN_HOLDSWORTH_DB,
  "Barney Kessel": BARNEY_KESSEL_DB,
  "Bill Frisell": BILL_FRISELL_DB,
  "Charlie Christian": CHARLIE_CHRISTIAN_DB,
  "Django Reinhardt": DJANGO_REINHARDT_DB,
  "Ed Bickert": ED_BICKERT_DB,
  "George Benson": GEORGE_BENSON_DB,
  "Gilad Hekselman": GILAD_HEKSELMAN_DB,
  "Grant Green": GRANT_GREEN_DB,
  "Herb Ellis": HERB_ELLIS_DB,
  "Jim Hall": JIM_HALL_DB,
  "Joe Pass": JOE_PASS_DB,
  "John McLaughlin": JOHN_MCLAUGHLIN_DB,
  "John Scofield": JOHN_SCOFIELD_DB,
  "Julian Lage": JULIAN_LAGE_DB,
  "Kenny Burrell": KENNY_BURRELL_DB,
  "Kurt Rosenwinkel": KURT_ROSENWINKEL_DB,
  "Lenny Breau": LENNY_BREAU_DB,
  "Mike Stern": MIKE_STERN_DB,
  "Pasquale Grasso": PASQUALE_GRASSO_DB,
  "Pat Metheny": PAT_METHENY_DB,
  "Peter Bernstein": PETER_BERNSTEIN_DB,
  "Tal Farlow": TAL_FARLOW_DB,
  "Toshiki Nunokawa (布川俊樹)": TOSHIKI_NUNOKAWA_DB,
  "Wes Montgomery": WES_MONTGOMERY_DB,
};
