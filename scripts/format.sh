currentDir=${PWD}

echo
echo "Start formatting files!"
echo

prettier --write "./**/*{.ts,.test.ts}"

echo
echo "Formatted!"
echo
