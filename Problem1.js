var sum_to_n_a = function(n) {
    let result = 0;

    for (let i = 1; i < n + 1; i++) {
        result += i;
    }

    return result;
};

var sum_to_n_b = function(n) {

    if (n == 1) {
        return 1;
    } else {
        return n + sum_to_n_b(n - 1);
    }
};

var sum_to_n_c = function(n) {
    let result = n * (n + 1) / 2;
    return result;
};

