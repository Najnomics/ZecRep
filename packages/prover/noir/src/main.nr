fn main(total_zats: Field, bronze_max: Field, silver_max: Field, gold_max: Field) -> pub Field {
    constrain total_zats >= 0;

    if (total_zats <= bronze_max) {
        return 1;
    }
    if (total_zats <= silver_max) {
        return 2;
    }
    if (total_zats <= gold_max) {
        return 3;
    }
    return 4;
}

