<?php
require_once (dirname(__FILE__) . '/../app/Users.php');
$users = new Users();
$users = $users->get_users_data();
//var_dump($users);
?>

<!DOCTYPE html>
<html>
<head>
	<meta charset="utf-8">
	<meta http-equiv="X-UA-Compatible" content="IE=edge">
	<title></title>
	<link rel="stylesheet" href="">
	<style type="text/css" media="screen">
		th{
			text-align: left;
		}
	</style>
</head>
<body>
	<table>
			<tbody>
				<?php foreach ($users as $user): ?>
				<tr>
					<th class="userName"><a href="http://b.hatena.ne.jp/<?php echo $user['name'] ?>/" target="_blank"><?php echo $user['name'] ?></a></th>
					<td class="userKarma"><?php echo $user['karma'] ?></td>
					<td class="userScore"><?php echo $user['score'] ?></td>
					<td class="starYellow"><?php echo $user['star_yellow'] ?></td>
					<td class="starGreen"><?php echo $user['star_green'] ?></td>
					<td class="starRed"><?php echo $user['star_red'] ?></td>
					<td class="starBlue"><?php echo $user['star_blue'] ?></td>
					<td class="starPurple"><?php echo $user['star_purple'] ?></td>
				</tr>
				<?php endforeach; ?>
			</tbody>
		</table>	
	
</body>
</html>