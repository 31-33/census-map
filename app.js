var express = require('express');
var sqlite3 = require('sqlite3').verbose();
var fs = require('fs');
var bz2 = require('unbzip2-stream');

const PORT = process.env.PORT || 3000;

fs.createReadStream('./data/census2013.db.bz2')
    .pipe(bz2())
    .pipe(fs.createWriteStream('./data/census2013.db'));

const db = new sqlite3.Database(`./data/census2013.db`, sqlite3.OPEN_READONLY, err => {
    if(err) return console.log(`Error: ${err}`);
    console.log('Initialized SQlite database');
});

var server = express();

server.use('', express.static(`${__dirname}/client`));

server.get('/regions', (req, res) => {
    db.all(
        "SELECT wkt, name, id FROM region_coordinates", 
        (err, regions) => res.send(regions)
    );
});

server.get('/areas/:region_id', (req, res) => {
    db.all(
        "SELECT wkt, name, id FROM area_coordinates WHERE region_id = ?",
        req.params.region_id,
        (err, areas) => res.send(areas)
    );
});

server.get('/meshblocks/:area_id', (req, res) => {
    db.all(
        "SELECT wkt, name, id FROM meshblock_coordinates WHERE area_id = ?",
        req.params.area_id,
        (err, meshblocks) => res.send(meshblocks)
    );
});

server.get('/nz/', (req, res) => {
    res.send({
        name: 'Total New Zealand',
        usual_resident_male: 2064015,
        usual_resident_female: 2178033,
        usual_resident_age_0_4: 292041,
        usual_resident_age_5_9: 286758,
        usual_resident_age_10_14: 286833,
        usual_resident_age_15_19: 295758,
        usual_resident_age_20_24: 290688,
        usual_resident_age_25_29: 258135,
        usual_resident_age_30_34: 256554,
        usual_resident_age_35_39: 267519,
        usual_resident_age_40_44: 305754,
        usual_resident_age_45_49: 301635,
        usual_resident_age_50_54: 299994,
        usual_resident_age_55_59: 260187,
        usual_resident_age_60_64: 233163,
        usual_resident_age_65_over: 607035,
        language_english: 3819969,
        language_maori: 148395,
        language_samoan: 86403,
        language_nz_sign: 20235,
        language_other: 590157,
        language_none: 67509,
        language_total_responses: 3973359,
        religion_none: 1635345,
        religion_buddhist: 58407,
        religion_christian: 1858980,
        religion_hindu: 89919,
        religion_islam_muslim: 46146,
        religion_judaism_jewish: 6867,
        religion_maori_christian: 52950,
        religion_spiritualism_and_new_age: 18288,
        religion_other: 34342,
        religion_object_to_answering: 173034,
        smoker_regular: 463194,
        smoker_ex: 702015,
        smoker_never: 1900617,
        income_total_under_5000: 446472,
        income_total_5000_10000: 164967,
        income_total_10000_20000: 554028,
        income_total_20000_30000: 417993,
        income_total_30000_50000: 652275,
        income_total_50000_over: 814749,
        income_source_wages_salary_bonuses: 1809534,
        income_source_self_employment_business: 483489,
        income_source_investment_dividends: 655059,
        income_source_work_accident_insurer: 36270,
        income_source_nz_super_veterans_pension: 526434,
        income_source_other_super_super_pensions_annuities: 83904,
        income_source_unemployed_benefit: 91479,
        income_source_sickness_benefit: 78411,
        income_source_domestic_purposes_benefit: 86136,
        income_source_invalids_benefit: 74499,
        income_source_student_allowance: 89361,
        income_source_govt_payments_pension: 131121,
        income_source_other: 60165,
        income_source_none: 233625,
        weekly_rent_under_100: 37587,
        weekly_rent_100_149: 35904,
        weekly_rent_150_199: 41265,
        weekly_rent_200_249: 53106,
        weekly_rent_250_299: 64743,
        weekly_rent_300_349: 63801,
        weekly_rent_350_over: 139770,
        dwelling_owned_or_partly_owned: 725445,
        dwelling_not_owned: 512109,
        dwelling_held_in_family_trust: 215280,
        dwelling_rented: 453135
    });
});

server.listen(PORT);
