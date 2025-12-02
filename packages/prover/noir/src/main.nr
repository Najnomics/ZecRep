fn main(total_zats: Field, bronze_max: Field, silver_max: Field, gold_max: Field) -> pub Field {
    constrain total_zats >= 0;
    constrain bronze_max < silver_max;
    constrain silver_max < gold_max;

    let tier = if total_zats <= bronze_max {
        1
    } else if total_zats <= silver_max {
        2
    } else if total_zats <= gold_max {
        3
    } else {
        4
    };

    tier
}

