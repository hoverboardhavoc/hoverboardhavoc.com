// =====================================================================
// i-MiEV HV pack drop cradle, v2: narrow spine
//
// Units: mm. Car's front is +Y. Pack rolls out along -X (operator side).
// Z is height above the floor.
//
// A 480 x 870 ladder of 30x30 under the pack's belly carries two Biltema
// 15-891 scissor jacks on 40x40 angle shelves, each jack with a 555 mm
// 25x25 bearer bar bolted to its saddle under one of the pack's belly
// spars, and four stem-mounted swivel castors on mitred 30x30 arms at
// the corners. Nothing on the frame is taller than the castor arms,
// under a pack whose underside is the deck height echoed below.
//
// The 15-891 saddle is held level by the meshed gear teeth on the upper
// arms; it is not a pivot. Roll about the line through the two jacks is
// resisted in the plane of each scissor (its stiff direction); pitch is
// resisted by the two screws 555 mm apart. Bolt the bases down and strap
// the pack to the bars so pack, bars and jacks are one body.
//
// Every length of steel is a module of its own (PARTS section) with its
// cuts and holes in its own coordinates. The ASSEMBLY only places parts;
// the PARTS LAYOUT lays one of each out flat with its label. Set
// show_parts = true for that view, show_dims = true for dimension lines
// on the assembly. ./bom.sh prints the checks and cut list.
//
// MEASURED = off the real part or the shop's sheet. EST = guess, check
// before cutting.
// =====================================================================

// ---------- what to show -------------------------------------------
show_cradle  = true;
show_pack    = true;     // pack ghost riding on the deck
show_car     = true;     // sill line, installed pack outline
show_dims    = false;    // dimension lines on the assembly
show_parts   = true;    // parts laid out flat instead of the assembly

jack_height  = 95;       // 95 collapsed .. 390 open. 305 meets the pack.
$fn = 48;

// ---------- Biltema 15-891 scissor jack ----------------------------
JACK_CLOSED      = 95;      // MEASURED
JACK_OPEN        = 390;     // MEASURED
JACK_SADDLE_CTRS = 31.85;   // MEASURED, M6, assumed along the screw axis
JACK_BASE_CTRS   = 100.05;  // MEASURED, 8 mm holes, assumed along the screw
JACK_BASE_L      = 180;     // EST  base plate along the screw
JACK_BASE_W      = 116;     // MEASURED  base plate across the screw
JACK_BASE_T      = 8;       // EST
JACK_SADDLE_L    = 70;      // EST
JACK_SADDLE_W    = 45;      // EST
JACK_SADDLE_T    = 12;      // EST
JACK_ARM         = 190;     // EST  half-diagonal of the scissor
JACK_ARM_W       = 22;      // EST
JACK_CRANK_STUB  = 70;      // EST  screw end beyond the side pivot

// ---------- stem swivel castors off the Jula Meec Tools transport
// plate (011607), four, one braked --------------------------------------
CASTOR_H       = 98;     // MEASURED  floor to the face that meets the frame,
                         //           wheel on the ground. Arm sits on this.
CASTOR_WHEEL_D = 75;     // EST
CASTOR_WHEEL_W = 25;     // EST
CASTOR_OFFSET  = 25;     // EST  stem axis to wheel axle (trail)
CASTOR_SWEEP   = 55;     // MEASURED  bolt axis to the wheel's far edge
CASTOR_STEM    = 10;     // MEASURED  9.7 mm: M10. A bolt through the swivel
                         //           head with its nut underneath, not a
                         //           fixed stud: the head sits inside the arm.
CASTOR_MAX_KG  = 60;     // EST  per castor, unmarked; tray is rated 100
CASTOR_HEAD_D  = 50;     // EST  swivel head diameter

// ---------- stock (Biltema square tube is 1.5 mm S195 in every size) --
TUBE_WALL  = 1.5;
FRAME_SZ   = 30;      // 79-658: side rails, castor uprights, castor arms.
                      // Every frame corner is a matched 30-on-30 mitre.
ANGLE_SZ   = 30;      // 79-619 Vinkelprofil 30x30, Q235: jack shelves spanning
                      // rail to rail, 2.7x in bending. All Biltema angles
                      // are 3 mm, so the size costs nothing in height.
ANGLE_WALL = 3;       // MEASURED (Biltema sheet); goes straight into the deck
BAR        = 25;      // 25x25 box, the bearer bars, bolted to the saddles.
BAR_WALL   = 1.5;     // Stock on hand; 1.5 mm S195 if it is Biltema's.
BAR_L      = 555;     // along X, under one of the pack's belly spars.
                      // No plate on top: the spars are at a known 555 and
                      // the jacks sit under them.
SADDLE_BOLT_L = 16;   // the jack's own M6 hex bolts, heads inside the bar
ACCESS_HOLE   = 14;   // in the bar's top wall, for a 10 mm socket on the head
BOLT_L      = 50;     // Sekskantskrue M10 x 50 fzb (2000054827); head inside
BOLT_HEAD_H = 6.4;    //   the arm on a 20 mm washer, nut in the castor's recess
WASHER_OD   = 20;     // MEASURED  washers from the tray
WASHER_T    = 2;
NUT_H       = 8;      // M10 lock nut from the tray
ARM_GAP    = 5;       // swing circle to the upright's outer face

// ---------- cradle geometry ----------------------------------------
GROUND_CLEAR = 15;    // frame underside to floor; a garage jack in the shed runs 15
FRAME_W      = 480;   // outer width of the side rails, across the car
JACK_Y       = [-277.5, 277.5];   // under the two middle belly spars,
                                  // MEASURED 555 apart
WELL_CLEAR   = 5;     // gap between jack base and angle leg, each side
CASTOR_Y     = 420;   // castor uprights at +-CASTOR_Y, at the rail ends.
                      // The arms run on along the rail past the ends, so
                      // the operator's side of the frame carries nothing
                      // but the crank stubs and a ratchet swings clear.
RATCHET_R    = 250;   // ratchet handle sweep about the crank eye
FRAME_L      = 2*(CASTOR_Y + FRAME_SZ/2);   // rails end flush with the uprights

// ---------- pack and car (EST unless marked) -----------------------
PACK_L = 1400;  PACK_W = 700;  PACK_H = 275;   // L, W from a forum
                         // description of the case ("1.4 m by 0.7 m");
                         // H still unknown. Four transverse box spars
                         // on the belly; the middle two are 555 apart.
PACK_CM_H = 120;         // EST  pack centre of mass above its underside
SILL_H = 470;            // MEASURED, rear on ramps, target front
PACK_UNDER_INSTALLED = 395;   // MEASURED: the two middle spars are at 380
                              // and 395 with the car at 400 front / 470 rear.
                              // The 15 mm between them is the car's rake.
                              // Raising the front lifts both; do the lift-off
                              // and descent with the car as it is, and raise
                              // the front only afterwards, for the roll-out.
CLEARANCE_RULE = 340;    // sill - pack underside, from the 5by9 setup

// =====================================================================
// DERIVED
// =====================================================================
rail_x     = FRAME_W/2 - FRAME_SZ/2;             // side rail centre
frame_top  = GROUND_CLEAR + FRAME_SZ;
shelf_z    = GROUND_CLEAR + ANGLE_WALL;          // jack base sits here
bar_bot    = shelf_z + jack_height;              // bar bolted on saddle
bar_bot_c  = shelf_z + JACK_CLOSED;              // ... collapsed
deck_top   = bar_bot + BAR;                      // pack underside now
deck_top_c = bar_bot_c + BAR;                    // ... collapsed
deck_top_o = shelf_z + JACK_OPEN + BAR;
well_half  = JACK_BASE_W/2 + WELL_CLEAR;         // base edge to angle leg
ANGLE_LEN  = FRAME_W - 2*FRAME_SZ;               // shelf angles span rail to rail
STUD_IN    = ANGLE_WALL + WELL_CLEAR + 12;       // stud from the angle's back
// shelf angle in bending: half a jack at mid-span of ANGLE_LEN, simply
// supported. Equal angle b x t, vertical leg up: far fibre is the leg tip.
ang_b = ANGLE_SZ;  ang_t = ANGLE_WALL;
ang_c = (ang_b*ang_b + ang_b*ang_t - ang_t*ang_t) / (2*(2*ang_b - ang_t));
ang_I = (ang_t*(ang_b - ang_c)^3 + ang_b*ang_c^3 - (ang_b - ang_t)*(ang_c - ang_t)^3) / 3;
ang_Z = ang_I / (ang_b - ang_c);
ang_M = 0.5 * 230 * 9.81 / 2 * (ANGLE_LEN/4) / 1000;   // N.m
ang_MPa = ang_M * 1000 / ang_Z;
arm_top    = CASTOR_H + FRAME_SZ;
castor_x   = rail_x;                             // stem over the rail line
castor_yc  = CASTOR_Y + FRAME_SZ/2 + ARM_GAP + CASTOR_SWEEP;   // stem axis
arm_len    = FRAME_SZ + ARM_GAP + CASTOR_SWEEP + CASTOR_HEAD_D/2 + 5;   // to the long point
arm_hole   = castor_yc - (CASTOR_Y - FRAME_SZ/2);   // from the arm's long point
upright_lp = arm_top - GROUND_CLEAR;             // outer face, rail bottom to arm top
box30_total = 2*FRAME_L + 4*upright_lp + 4*arm_len;
// arm cantilever from the upright's outer face to the stem
arm_reach  = castor_yc - (CASTOR_Y + FRAME_SZ/2);
arm_M      = 0.25 * 260 * 9.81 * arm_reach / 1000;          // N.m
arm_Z      = (FRAME_SZ^4 - (FRAME_SZ - 2*TUBE_WALL)^4) / 12 / (FRAME_SZ/2);
arm_MPa    = arm_M * 1000 / arm_Z;
track      = 2*castor_x;
overall_w  = 2*(castor_x + CASTOR_SWEEP);
overall_l  = 2*(CASTOR_Y - FRAME_SZ/2 + arm_len);
sill_needed = deck_top_c + CLEARANCE_RULE;
// bearer bar: worst case the spar bears only at the bar's ends, half the
// pack on each bar, cantilevered BAR_L/2 from the saddle
bar_M   = 0.5 * 230 * 9.81 / 2 * (BAR_L/2) / 1000;   // N.m per side
bar_I   = (BAR^4 - (BAR - 2*BAR_WALL)^4) / 12;
bar_I_h = bar_I - ACCESS_HOLE * BAR_WALL * pow(BAR/2 - BAR_WALL/2, 2);   // top wall holed
bar_Z   = bar_I_h / (BAR/2);   // mm3, at the access hole
bar_MPa = bar_M * 1000 / bar_Z;
// rail: beam between the castors carrying the two shelf reactions
rail_a  = castor_yc - JACK_Y[1];                 // shelf to castor, along Y
rail_M  = 0.5 * 230 * 9.81 / 2 * rail_a / 1000;
rail_Z  = arm_Z;
rail_MPa = rail_M * 1000 / rail_Z;
jack_to_meet = PACK_UNDER_INSTALLED - BAR - shelf_z;

// collapsed scissor geometry, for the crank and arm clearance checks
c_link  = JACK_CLOSED - JACK_BASE_T - JACK_SADDLE_T;
c_span  = JACK_ARM * cos(asin(min(c_link/2 / JACK_ARM, 1)));
crank_x = -(c_span + JACK_CRANK_STUB);
screw_bot = shelf_z + JACK_BASE_T + c_link/2 - 7;   // crank stub radius 7

// stability on the castors, loaded and collapsed
cm_h    = (230 * (deck_top_c + PACK_CM_H) + 30 * 40) / 260;
tip_deg = atan((track/2) / cm_h);

echo("---- height ----");
echo(str("pack underside, collapsed = ", deck_top_c,
         "  (", GROUND_CLEAR, " clear + ", ANGLE_WALL, " shelf + ",
         JACK_CLOSED, " jack + ", BAR, " bar)"));
echo(str("sill needed = ", sill_needed, "   available = ", SILL_H,
         "   margin = ", SILL_H - sill_needed));
echo(str("pack underside, jack open = ", deck_top_o,
         "   installed pack underside = ", PACK_UNDER_INSTALLED,
         "   reach spare = ", deck_top_o - PACK_UNDER_INSTALLED,
         "   jack height to meet it = ", jack_to_meet));
echo("---- stress ----");
echo(str("bearer bar ", BAR, "x", BAR, "x", BAR_WALL, " at the ", ACCESS_HOLE, " access hole: worst-case ", round(bar_M),
         " N.m -> ", round(bar_MPa), " MPa (", round(10*195/bar_MPa)/10, "x on S195);",
         " spar bearing along the bar ~", round(bar_M/2), " N.m -> ", round(bar_MPa/2), " MPa"));
echo(str("shelf angle ", ANGLE_SZ, "x", ANGLE_SZ, "x", ANGLE_WALL, " over ", ANGLE_LEN,
         ": ", round(ang_M), " N.m -> ", round(ang_MPa), " MPa, ",
         round(10*235/ang_MPa)/10, "x on Q235"));
echo(str("rail ", FRAME_SZ, "x", FRAME_SZ, "x", TUBE_WALL, ": ", round(rail_M), " N.m -> ",
         round(rail_MPa), " MPa, ", round(10*195/rail_MPa)/10, "x on S195"));
echo(str("castor arm: ", round(arm_M), " N.m -> ", round(arm_MPa), " MPa, ",
         round(10*195/arm_MPa)/10, "x on S195"));
echo("---- footprint ----");
echo(str("frame ", FRAME_W, " x ", FRAME_L, "   overall ", overall_w, " x ", overall_l,
         " over the arms and wheel sweep   track ", track, "   wheelbase ", 2*castor_yc,
         "   pack ", PACK_W, " x ", PACK_L,
         overall_w < PACK_W && overall_l < PACK_L ? "   OK inside pack" : "   FOUL"));
// a ratchet straight on the crank eye swings in a plane ~30 mm outboard
// of the eye (socket depth); the castors must stay inboard of that plane
echo(str("ratchet plane at X = ", round(crank_x - 30), " (eye + socket); wheel sweep reaches X = ",
         -(castor_x + CASTOR_SWEEP),
         castor_x + CASTOR_SWEEP < -crank_x + 30 ? "   OK, inboard of the ratchet" : "   check"));
echo(str("tallest frame part = castor arm top at ", arm_top,
         "   clearance to pack ", deck_top_c - arm_top,
         deck_top_c > arm_top ? "   OK (bolt head inside the arm)" : "   FOUL: castor too tall"));
echo("---- jack ----");
echo(str("crank eye collapsed at X = ", crank_x,
         "   frame outer face at ", -FRAME_W/2,
         crank_x < -FRAME_W/2 ? "   OK clear" : "   FOUL: eye inside frame"));
echo(str("far arm tip collapsed at X = ", c_span,
         "   rail inner face at ", FRAME_W/2 - FRAME_SZ,
         c_span < FRAME_W/2 - FRAME_SZ ? "   OK" : "   FOUL"));
echo(str("screw underside over rail: ", screw_bot, " vs rail top ", frame_top,
         "   clearance ", screw_bot - frame_top,
         screw_bot > frame_top + 5 ? "   OK" : "   FOUL"));
echo("---- load and stability ----");
echo(str("castors 4 x ", CASTOR_MAX_KG, " = ", 4*CASTOR_MAX_KG,
         " kg against ~260 kg loaded: ", round(100*260/(4*CASTOR_MAX_KG)), "% of rating"));
echo(str("loaded CoM ~", round(cm_h), " up, half-track ", track/2,
         "   tip angle ", round(tip_deg), " deg  (5by9 dollies ~38)"));
echo("---- cut list (lengths to the long points) ----");
echo(str("A  ", FRAME_SZ, "x", FRAME_SZ, " side rail       x2  ", FRAME_L, ", mitred both ends"));
echo(str("B  ", FRAME_SZ, "x", FRAME_SZ, " castor upright  x4  ", upright_lp,
         " overall; two parallel 45 cuts, each face ", upright_lp - FRAME_SZ));
echo(str("C  ", FRAME_SZ, "x", FRAME_SZ, " castor arm      x4  ", arm_len,
         " on the top face, mitred inner end (bottom face ", arm_len - FRAME_SZ, "); ", CASTOR_STEM + 0.5, " hole in the bottom wall at ", arm_hole,
         " from the long point, 20 access hole above"));
echo(str("   ", FRAME_SZ, "x", FRAME_SZ, " total ", box30_total, "  (2 x 2 m of 79-658)"));
echo(str("D  ", ANGLE_SZ, "x", ANGLE_SZ, "x", ANGLE_WALL, " angle shelf  x4  ", ANGLE_LEN,
         " (79-619); 8.5 stud holes at ", ANGLE_LEN/2 - JACK_BASE_CTRS/2, " and ",
         ANGLE_LEN/2 + JACK_BASE_CTRS/2, ", ", STUD_IN, " from the back"));
echo(str("E  ", BAR, "x", BAR, " bearer bar       x2  ", BAR_L,
         "; 6.5 holes in the bottom wall only at ", BAR_L/2 - JACK_SADDLE_CTRS/2, " and ",
         BAR_L/2 + JACK_SADDLE_CTRS/2, ", ", ACCESS_HOLE, " access holes in the top wall above them (stock on hand).",
         " The jack's own M6 hex bolts, heads inside, 10 mm socket through the access hole"));
echo(str("F  jack 15-891 x2: base drilled 8.5 at ", STUD_IN - ANGLE_WALL - WELL_CLEAR,
         " in from each long edge, ", JACK_BASE_CTRS, " apart; saddle holes tapped M6"));
echo(str("G  castor, Jula 011607 tray, x4, with its M10 nut and 20 mm washer"));
echo(str("   M10 x ", BOLT_L, " hex bolt x4 (Biltema 2000054827): head inside the arm on the washer,",
         " held with a 17 mm ring spanner through the arm's open end, or tacked"));
echo(str("   M8 x 25 hex, nuts and washers x8 for the jack bases"));

// =====================================================================
// STOCK SECTIONS
// =====================================================================

// square tube along +Z from origin corner
module sq_tube(size, len, wall = TUBE_WALL) {
    difference() {
        cube([size, size, len]);
        translate([wall, wall, -1]) cube([size - 2*wall, size - 2*wall, len + 2]);
    }
}
// tube along +X from x=0, centred on Y, bottom on z=0
module tube_x(size, len, wall = TUBE_WALL) {
    translate([0, -size/2, 0]) rotate([0, 90, 0])
        translate([-size, 0, 0]) sq_tube(size, len, wall);
}
// tube along +Y from y=0, centred on X, bottom on z=0
module tube_y(size, len, wall = TUBE_WALL) {
    translate([-size/2, 0, size]) rotate([-90, 0, 0]) sq_tube(size, len, wall);
}
// tube along +Z from z=0, centred on X and Y
module tube_z(size, len, wall = TUBE_WALL) {
    translate([-size/2, -size/2, 0]) sq_tube(size, len, wall);
}

// A 45-degree wedge for mitring a tube end. Removes the material on the
// far side of the plane through the origin whose normal is (0, ny, nz):
// the plane runs at 45 degrees in the Y-Z plane.
module wedge(ny, nz) {
    rotate([atan2(nz, ny) - 90, 0, 0]) translate([-1000, -1000, 0]) cube([2000, 2000, 2000]);
}

// =====================================================================
// PARTS: one module per length of steel, in its own coordinates.
// Long points are where the mitre reaches furthest.
// =====================================================================

// A: side rail. Along Y, centred, bottom on z=0. Long points are the
// bottom-outer corners; the top is FRAME_SZ shorter at each end.
module part_rail() {
    color("SteelBlue") difference() {
        translate([0, -FRAME_L/2, 0]) tube_y(FRAME_SZ, FRAME_L);
        translate([0,  FRAME_L/2, 0]) wedge( 1, 1);     // remove z > L/2 - y
        translate([0, -FRAME_L/2, 0]) wedge(-1, 1);
    }
}

// B: castor upright. Along Z from z=0, outer face at y=+FRAME_SZ/2.
// The rail comes in below on the inner side and the arm leaves above on
// the outer side, so the two 45-degree cuts are parallel and the piece
// is a parallelogram: outer face from z=0 to h-FRAME_SZ (meets the
// rail's bottom corner, stops under the arm), inner face from FRAME_SZ
// to h (starts at the rail's top, runs up to the arm's top).
module part_upright() {
    h = upright_lp;  a = FRAME_SZ/2;
    color("SteelBlue") difference() {
        tube_z(FRAME_SZ, h);
        translate([0,  a, 0]) wedge(-1, -1);  // bottom: remove z < a - y
        translate([0, -a, h]) wedge( 1,  1);  // top: remove z > h - (y + a)
    }
}

// C: castor arm. Along +Y from y=0 (inner TOP long point) to arm_len,
// centred on X, bottom on z=0. Inner end mitred: the bottom is FRAME_SZ
// shorter, since it lands on the upright's outer face while the top runs
// in to the upright's inner face. Stem hole in the bottom wall, access
// hole in the top wall.
module part_arm() {
    color("SteelBlue") difference() {
        tube_y(FRAME_SZ, arm_len);
        translate([0, 0, FRAME_SZ]) wedge(-1, -1);     // remove z < FRAME_SZ - y
        translate([0, arm_hole, -1]) cylinder(d = CASTOR_STEM + 0.5, h = TUBE_WALL + 2);
        translate([0, arm_hole, FRAME_SZ - TUBE_WALL - 1]) cylinder(d = 20, h = TUBE_WALL + 2);
    }
}

// D: jack shelf, 40x40x3 angle along +X from x=0. Vertical leg on
// y = 0..3, flange on z = 0..3 reaching to y = 40. Two stud holes.
module part_shelf_angle() {
    color("Peru") difference() {
        union() {
            cube([ANGLE_LEN, ANGLE_WALL, ANGLE_SZ]);
            cube([ANGLE_LEN, ANGLE_SZ, ANGLE_WALL]);
        }
        for (x = [-1, 1])
            translate([ANGLE_LEN/2 + x*JACK_BASE_CTRS/2, STUD_IN, -1]) cylinder(d = 8.5, h = 10);
    }
}

// E: bearer bar, 25x25 along +X from x=0, centred on Y, bottom on z=0.
// Two 6.5 mm holes in the bottom wall for the jack's own M6 hex bolts,
// heads inside, and a 14 mm access hole in the top wall above each for
// the socket. Nothing proud. The access holes take ~55% out of the
// compression flange over the saddle; see the bar stress echo.
module part_bar() {
    color("Crimson") difference() {
        tube_x(BAR, BAR_L, BAR_WALL);
        for (x = [-1, 1]) {
            translate([BAR_L/2 + x*JACK_SADDLE_CTRS/2, 0, -1]) cylinder(d = 6.5, h = BAR_WALL + 2);
            translate([BAR_L/2 + x*JACK_SADDLE_CTRS/2, 0, BAR - BAR_WALL - 1]) cylinder(d = ACCESS_HOLE, h = BAR_WALL + 2);
        }
    }
}

// F: jack, origin at floor level under the base centre; screw along X,
// crank toward -X. Geometry from v1.
module jack_arm(p1, p2, w = JACK_ARM_W, t = 10) {
    hull() {
        translate(p1) rotate([90, 0, 0]) cylinder(d = w, h = t, center = true);
        translate(p2) rotate([90, 0, 0]) cylinder(d = w, h = t, center = true);
    }
}
module part_jack(h = JACK_CLOSED) {
    link_h = h - JACK_BASE_T - JACK_SADDLE_T;
    half   = link_h / 2;
    ang    = asin(min(half / JACK_ARM, 1));
    span   = JACK_ARM * cos(ang);
    color("DimGray") {
        translate([-JACK_BASE_L/2, -JACK_BASE_W/2, 0])
            cube([JACK_BASE_L, JACK_BASE_W, JACK_BASE_T]);
        translate([-JACK_SADDLE_L/2, -JACK_SADDLE_W/2, h - JACK_SADDLE_T])
            cube([JACK_SADDLE_L, JACK_SADDLE_W, JACK_SADDLE_T]);
    }

    color("Silver") {
        jack_arm([0, 0, JACK_BASE_T],          [-span, 0, JACK_BASE_T + half]);
        jack_arm([0, 0, JACK_BASE_T],          [ span, 0, JACK_BASE_T + half]);
        jack_arm([-span, 0, JACK_BASE_T+half], [0, 0, JACK_BASE_T + link_h]);
        jack_arm([ span, 0, JACK_BASE_T+half], [0, 0, JACK_BASE_T + link_h]);
    }
    color("Goldenrod") {
        translate([-span, 0, JACK_BASE_T + half])
            rotate([0, 90, 0]) cylinder(d = 10, h = 2 * span);
        translate([-span - JACK_CRANK_STUB, 0, JACK_BASE_T + half])
            rotate([0, 90, 0]) cylinder(d = 14, h = JACK_CRANK_STUB);
    }
}

// G: castor. Origin on the bolt axis at the face that meets the arm;
// hangs CASTOR_H to the floor. Drawn trailing along +X, with its swing
// circle as a ghost ring on the floor.
module part_castor() {
    color("Silver") translate([0, 0, -10]) cylinder(d = CASTOR_HEAD_D, h = 10);
    // nut in the recess under the swivel head
    color("Gainsboro") translate([0, 0, -10 - NUT_H]) cylinder(d = 17 / cos(30), h = NUT_H, $fn = 6);
    color("Silver")
    for (s = [-1, 1])
        translate([CASTOR_OFFSET - 12, s*(CASTOR_WHEEL_W/2 + 2) - 2,
                   -CASTOR_H + CASTOR_WHEEL_D/2 - 8])
            cube([24, 4, CASTOR_H - CASTOR_WHEEL_D/2 - 2]);
    color("DarkSlateGray")
        translate([CASTOR_OFFSET, -CASTOR_WHEEL_W/2, -CASTOR_H + CASTOR_WHEEL_D/2])
            rotate([-90, 0, 0]) cylinder(d = CASTOR_WHEEL_D, h = CASTOR_WHEEL_W);
    color([1, 0.5, 0, 0.3]) translate([0, 0, -CASTOR_H])
        difference() { cylinder(r = CASTOR_SWEEP, h = 1); cylinder(r = CASTOR_SWEEP - 2, h = 3, center = true); }
}

// hardware drawn in the assembly
module stud_m8()  { color("Gainsboro") cylinder(d = 8, h = 25); }
// M6 x 16 hex bolt, origin at the bar's bottom-wall top face, pointing down
// into the saddle; head inside the bar
module saddle_bolt() {
    color("Gainsboro") {
        cylinder(d = 10 / cos(30), h = 4, $fn = 6);
        translate([0, 0, -SADDLE_BOLT_L]) cylinder(d = 6, h = SADDLE_BOLT_L);
    }
}
// M10 x BOLT_L hex bolt, origin at the arm's bottom-wall top face, pointing
// down: washer and head above the wall, shank through wall and castor,
// nut below the swivel head.
module castor_bolt() {
    color("Gainsboro") {
        cylinder(d = WASHER_OD, h = WASHER_T);
        translate([0, 0, WASHER_T]) cylinder(d = 17 / cos(30), h = BOLT_HEAD_H, $fn = 6);
        translate([0, 0, -BOLT_L + WASHER_T]) cylinder(d = 10, h = BOLT_L);
    }
}

// =====================================================================
// ASSEMBLY: places parts only
// =====================================================================
module cradle() {
    // A: rails
    for (s = [-1, 1]) translate([s*rail_x, 0, GROUND_CLEAR]) part_rail();

    // B, C, G: corners. The upright's outer face is flush with the rail's
    // end; the arm starts at the upright's inner face and runs outward.
    for (s = [-1, 1], t = [-1, 1]) {
        translate([s*rail_x, t*CASTOR_Y, GROUND_CLEAR]) mirror([0, t < 0 ? 1 : 0, 0]) part_upright();
        translate([s*rail_x, t*(CASTOR_Y - FRAME_SZ/2), CASTOR_H]) mirror([0, t < 0 ? 1 : 0, 0]) part_arm();
        translate([s*castor_x, t*castor_yc, CASTOR_H + TUBE_WALL]) castor_bolt();
        translate([s*castor_x, t*castor_yc, CASTOR_H]) part_castor();
    }

    // D, E, F: jack wells. Angle legs outboard of the base, flanges inward.
    for (jy = JACK_Y) {
        for (s = [-1, 1]) {
            translate([-ANGLE_LEN/2, jy + s*(well_half + ANGLE_WALL), GROUND_CLEAR])
                mirror([0, s > 0 ? 1 : 0, 0]) part_shelf_angle();
            for (x = [-1, 1])
                translate([x*JACK_BASE_CTRS/2, jy + s*(well_half + ANGLE_WALL - STUD_IN), GROUND_CLEAR - 2])
                    stud_m8();
        }
        translate([0, jy, shelf_z]) part_jack(jack_height);
        translate([-BAR_L/2, jy, bar_bot]) part_bar();
        for (x = [-1, 1]) translate([x*JACK_SADDLE_CTRS/2, jy, bar_bot + BAR_WALL]) saddle_bolt();
    }
}

module pack_ghost() {
    color([0.55, 0.55, 0.55, 0.35]) translate([-PACK_W/2, -PACK_L/2, deck_top + 0.5])
        cube([PACK_W, PACK_L, PACK_H]);
}

module car_ghost() {
    color([0.3, 0.3, 0.3, 0.5])
    for (s = [-1, 1])
        translate([s * 625 - 25, -1200, SILL_H]) cube([50, 2400, 25]);
    color([0.2, 0.6, 0.2, 0.12])
        translate([-PACK_W/2, -PACK_L/2, PACK_UNDER_INSTALLED])
            cube([PACK_W, PACK_L, PACK_H]);
}

// =====================================================================
// DIMENSIONS: a line with end ticks and a label, from p1 to p2, ticks
// and label offset along `up`.
// =====================================================================
module dim(p1, p2, up = [0, 0, 1], label = "", size = 14) {
    d = p2 - p1;  L = norm(d);  u = d / L;
    txt = label == "" ? str(L) : label;
    vertical = abs(u[2]) > 0.5;
    a0 = atan2(u[1], u[0]);
    a  = (a0 > 90 || a0 <= -90) ? a0 + 180 : a0;   // keep text upright
    color("Black") {
        hull() { translate(p1) sphere(0.8); translate(p2) sphere(0.8); }
        for (p = [p1, p2]) hull() { translate(p - up*4) sphere(0.8); translate(p + up*4) sphere(0.8); }
        translate((p1 + p2)/2 + up*8)
            if (vertical)
                rotate([90, 0, 0]) linear_extrude(0.5)       // face -Y, read from the operator's side
                    text(txt, size = size, halign = "center", valign = "center");
            else
                rotate([0, 0, a]) linear_extrude(0.5)         // flat, read from above
                    text(txt, size = size, halign = "center");
    }
}

module dims() {
    z0 = GROUND_CLEAR;  zt = deck_top_c;
    dim([-rail_x - 15, -FRAME_L/2, z0 - 30], [-rail_x - 15, FRAME_L/2, z0 - 30], [0, 0, 1], str("rail ", FRAME_L));
    dim([-FRAME_W/2, -FRAME_L/2 - 60, z0], [FRAME_W/2, -FRAME_L/2 - 60, z0], [0, 0, 1], str("frame ", FRAME_W));
    dim([-castor_x, -castor_yc, -5], [-castor_x, castor_yc, -5], [0, 0, 1], str("castors ", 2*castor_yc));
    dim([castor_x, -castor_yc - 50, -5], [-castor_x, -castor_yc - 50, -5], [0, 0, 1], str("track ", track));
    dim([BAR_L/2 + 30, JACK_Y[0], bar_bot_c], [BAR_L/2 + 30, JACK_Y[1], bar_bot_c], [0, 0, 1], str("spars ", JACK_Y[1] - JACK_Y[0]));
    dim([-BAR_L/2 - 40, JACK_Y[0], 0], [-BAR_L/2 - 40, JACK_Y[0], zt], [-1, 0, 0], str("deck ", zt));
    dim([-rail_x - 40, JACK_Y[0] - 100, 0], [-rail_x - 40, JACK_Y[0] - 100, GROUND_CLEAR], [-1, 0, 0], str("clear ", GROUND_CLEAR));
    dim([-rail_x - 40, CASTOR_Y + FRAME_SZ/2, CASTOR_H], [-rail_x - 40, castor_yc, CASTOR_H], [0, 0, 1], str("reach ", arm_reach));
    dim([-rail_x - 40, CASTOR_Y + FRAME_SZ/2, 0], [-rail_x - 40, CASTOR_Y + FRAME_SZ/2, CASTOR_H], [-1, 0, 0], str("castor ", CASTOR_H));
    dim([BAR_L/2 + 30, JACK_Y[1] + well_half + ANGLE_WALL, z0], [BAR_L/2 + 30, JACK_Y[1] - well_half - ANGLE_WALL, z0], [0, 0, 1], str("well ", 2*(well_half + ANGLE_WALL)));
}

// =====================================================================
// PARTS LAYOUT: one of each, flat, with labels
// =====================================================================
module label(txt, at) {
    color("Black") translate(at) linear_extrude(0.5) text(txt, size = 16);
}
module parts_layout() {
    yA = 0;  yD = 100;  yE = 230;  yC = 340;  yB = 430;  yF = 570;  yG = 720;
    // A rail, laid along X
    translate([FRAME_L/2, yA, 0]) rotate([0, 0, 90]) part_rail();
    label(str("A  side rail  ", FRAME_L, "  x2"), [0, yA - 30, 0]);
    // D angle, stud holes dimensioned from the left end and from the back
    translate([0, yD, 0]) part_shelf_angle();
    label(str("D  angle shelf ", ANGLE_SZ, "x", ANGLE_SZ, "x3  ", ANGLE_LEN, "  x4"), [0, yD - 30, 0]);
    dim([0, yD + ANGLE_SZ + 12, 0], [ANGLE_LEN/2 - JACK_BASE_CTRS/2, yD + ANGLE_SZ + 12, 0], [0, 1, 0], str(ANGLE_LEN/2 - JACK_BASE_CTRS/2), 9);
    dim([0, yD + ANGLE_SZ + 34, 0], [ANGLE_LEN/2 + JACK_BASE_CTRS/2, yD + ANGLE_SZ + 34, 0], [0, 1, 0], str(ANGLE_LEN/2 + JACK_BASE_CTRS/2), 9);
    dim([ANGLE_LEN + 15, yD, 0], [ANGLE_LEN + 15, yD + STUD_IN, 0], [1, 0, 0], str(STUD_IN), 9);
    // E bar, holes dimensioned from the left end
    translate([0, yE, 0]) part_bar();
    label(str("E  bearer bar 25x25  ", BAR_L, "  x2"), [0, yE - 30, 0]);
    dim([0, yE + BAR/2 + 12, 0], [BAR_L/2 - JACK_SADDLE_CTRS/2, yE + BAR/2 + 12, 0], [0, 1, 0], str(BAR_L/2 - JACK_SADDLE_CTRS/2), 9);
    dim([0, yE + BAR/2 + 34, 0], [BAR_L/2 + JACK_SADDLE_CTRS/2, yE + BAR/2 + 34, 0], [0, 1, 0], str(BAR_L/2 + JACK_SADDLE_CTRS/2), 9);
    // C arm, laid along X, long (top) face toward -Y; hole from the long point
    translate([0, yC, 0]) rotate([0, 0, -90]) mirror([1, 0, 0]) part_arm();
    label(str("C  castor arm  ", arm_len, "  x4, hole at ", arm_hole), [0, yC - 30, 0]);
    dim([0, yC + FRAME_SZ/2 + 12, 0], [arm_hole, yC + FRAME_SZ/2 + 12, 0], [0, 1, 0], str(arm_hole), 9);
    // B upright, laid along X with its outer face down
    translate([0, yB, 0]) rotate([0, 90, 0]) rotate([0, 0, 90]) part_upright();
    label(str("B  castor upright  ", upright_lp, " overall, faces ", upright_lp - FRAME_SZ, "  x4"), [0, yB - 30, 0]);
    // F jack, collapsed
    translate([JACK_BASE_L/2 + 60, yF, 0]) part_jack(JACK_CLOSED);
    label("F  jack 15-891  x2", [0, yF - 80, 0]);
    // G castor
    translate([60, yG, CASTOR_H]) part_castor();
    label("G  castor  x4", [0, yG - 60, 0]);
}

// ---------- render -------------------------------------------------
if (show_parts) {
    parts_layout();
} else {
    if (show_cradle) cradle();
    if (show_pack)   pack_ghost();
    if (show_car)    car_ghost();
    if (show_dims)   dims();
}
